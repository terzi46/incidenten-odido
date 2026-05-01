import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    }))
  );
}
