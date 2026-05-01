"use server";

import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import { getTextEmbedding } from "../lib/embeddings";
import { saveIncidentVector } from "../lib/incident-vectors";

export async function createIncident(formData: FormData) {
  const raw = Object.fromEntries(formData);

  const datumStr = raw.datum as string;
  const [day, month, year] = datumStr.split(".");
  const datum = new Date(`${year}-${month}-${day}T00:00:00Z`);

  const incident = await prisma.incident.create({
    data: {
      incTicket: raw.incTicket as string,
      datum,
      postcodeHuisnr: raw.postcodeHuisnr as string,
      klantnummer: raw.klantnummer as string,
      casenummer: (raw.casenummer as string) || null,
      goCareTicket: (raw.goCareTicket as string) || null,
      onderwerp: raw.onderwerp as string,
      aangemaaktDoor: raw.aangemaaktDoor as string,
      segment: (raw.segment as string) || null,
      solved: raw.solved === "true",
      st: (raw.st as string) || null,
      opmerkingen: (raw.opmerkingen as string) || null,
      voorgaandTicket: (raw.voorgaandTicket as string) || null,
    },
  });

  try {
    const vector = await getTextEmbedding(incident.onderwerp, "retrieval.passage");
    await saveIncidentVector(incident.id, vector);
  } catch (error) {
    console.error("Failed to store incident embedding", error);
  }

  // Record in audit log
  await prisma.auditLog.create({
    data: {
      action: "create",
      incTicket: incident.incTicket,
      performedBy: (raw.aangemaaktDoor as string) || "Onbekend",
    }
  });

  redirect("/");
}
