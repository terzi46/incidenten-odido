import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = await prisma.incident.findUnique({
    where: { id: parseInt(id) },
  });
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...incident,
    datum: incident.datum.toISOString(),
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const performedBy = body.performedBy || "Onbekend";

  const old = await prisma.incident.findUnique({ where: { id: parseInt(id) } });
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  const allowedFields = [
    "incTicket", "datum", "postcodeHuisnr", "klantnummer", "casenummer",
    "goCareTicket", "onderwerp", "aangemaaktDoor", "segment", "solved",
    "st", "opmerkingen", "voorgaandTicket",
  ];

  for (const field of allowedFields) {
    if (field in body) {
      const oldVal = String((old as any)[field] ?? "");
      const newVal = String(body[field] ?? "");
      // Only include fields that actually changed
      if (oldVal !== newVal) {
        updateData[field] = body[field];
      }
    }
  }

  if (updateData.datum && typeof updateData.datum === "string") {
    const parts = (updateData.datum as string).split(".");
    if (parts.length === 3) {
      let [day, month, year] = parts;
      if (year.length === 2) year = `20${year}`;
      updateData.datum = new Date(`${year}-${month}-${day}T00:00:00Z`);
    }
  }

  const updated = await prisma.incident.update({
    where: { id: parseInt(id) },
    data: updateData as any,
  });

  // Audit log: track changed fields
  const changes: { field: string; oldValue: string; newValue: string }[] = [];
  for (const [key, val] of Object.entries(updateData)) {
    const oldVal = String((old as any)[key] ?? "");
    const newVal = String(val ?? "");
    if (oldVal !== newVal) {
      changes.push({ field: key, oldValue: oldVal, newValue: newVal });
    }
  }

  if (changes.length > 0) {
    await prisma.auditLog.createMany({
      data: changes.map((c) => ({
        action: "update",
        incTicket: old.incTicket,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
        performedBy,
      })),
    });
  }

  return NextResponse.json({
    ...updated,
    datum: updated.datum.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const performedBy = searchParams.get("performedBy") || "Onbekend";

  const old = await prisma.incident.findUnique({ where: { id: parseInt(id) } });
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.incident.delete({ where: { id: parseInt(id) } });

  await prisma.auditLog.create({
    data: {
      action: "delete",
      incTicket: old.incTicket,
      field: "all",
      oldValue: JSON.stringify(old),
      performedBy,
    },
  });

  return NextResponse.json({ success: true });
}
