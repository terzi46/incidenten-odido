import { prisma } from "@/app/lib/prisma";

type SimilarIncident = {
  id: number;
  incTicket: string;
  datum: Date;
  onderwerp: string;
  segment: string | null;
  solved: boolean;
  similarity: number;
};

function toVectorLiteral(vector: number[]) {
  if (vector.length !== 1024) {
    throw new Error(`Expected 1024-dimensional embedding, got ${vector.length}`);
  }

  for (const value of vector) {
    if (!Number.isFinite(value)) {
      throw new Error("Embedding contains a non-finite value");
    }
  }

  return `[${vector.join(",")}]`;
}

export async function saveIncidentVector(incidentId: number, vector: number[]) {
  await prisma.$executeRawUnsafe(
    "UPDATE incidents SET vectors = $1::vector WHERE id = $2",
    toVectorLiteral(vector),
    incidentId,
  );
}

export async function findSimilarIncidents(
  vector: number[],
  limit = 10,
  excludeIncidentId?: number,
) {
  const cappedLimit = Math.min(Math.max(limit, 1), 25);
  const excludeClause = excludeIncidentId ? "AND id <> $2" : "";
  const limitParam = excludeIncidentId ? "$3" : "$2";
  const params = excludeIncidentId
    ? [toVectorLiteral(vector), excludeIncidentId, cappedLimit]
    : [toVectorLiteral(vector), cappedLimit];

  return prisma.$queryRawUnsafe<SimilarIncident[]>(
    `
      SELECT
        id,
        inc_ticket AS "incTicket",
        datum,
        onderwerp,
        segment,
        solved,
        1 - (vectors <=> $1::vector) AS similarity
      FROM incidents
      WHERE vectors IS NOT NULL
      ${excludeClause}
      ORDER BY vectors <=> $1::vector
      LIMIT ${limitParam}
    `,
    ...params,
  );
}
