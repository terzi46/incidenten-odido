import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { getTextEmbeddings } from "../app/lib/embeddings";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type IncidentSubject = {
  id: number;
  incTicket: string;
  onderwerp: string;
};

function toVectorLiteral(vector: number[]) {
  if (vector.length !== 1024) {
    throw new Error(`Expected 1024-dimensional embedding, got ${vector.length}`);
  }

  return `[${vector.join(",")}]`;
}

async function vectorizeIncidents(limit: number) {
  const limitClause = Number.isFinite(limit) ? "LIMIT $1" : "";
  const params = Number.isFinite(limit) ? [limit] : [];
  const incidents = await prisma.$queryRawUnsafe<IncidentSubject[]>(
    `
      SELECT id, inc_ticket AS "incTicket", onderwerp
      FROM incidents
      WHERE vectors IS NULL
        AND onderwerp <> ''
      ORDER BY id ASC
      ${limitClause}
    `,
    ...params,
  );

  if (incidents.length === 0) {
    console.log("No incidents found to vectorize.");
    return;
  }

  const embeddings = await getTextEmbeddings(
    incidents.map((incident) => incident.onderwerp),
    "retrieval.passage",
  );

  for (const [index, incident] of incidents.entries()) {
    await prisma.$executeRawUnsafe(
      "UPDATE incidents SET vectors = $1::vector WHERE id = $2",
      toVectorLiteral(embeddings[index]),
      incident.id,
    );
    console.log(`Stored vector for ${incident.incTicket} (${incident.id})`);
  }
}

async function main() {
  const all = process.argv.includes("--all");
  const limit = all ? Number.POSITIVE_INFINITY : 1;

  await vectorizeIncidents(limit);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
