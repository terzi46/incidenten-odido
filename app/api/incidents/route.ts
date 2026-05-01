import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const incidents = await prisma.incident.findMany({
    orderBy: { datum: "desc" },
  });

  const serialized = incidents.map((inc) => ({
    ...inc,
    datum: inc.datum.toISOString(),
    createdAt: inc.createdAt.toISOString(),
    updatedAt: inc.updatedAt.toISOString(),
  }));

  return NextResponse.json(serialized);
}
