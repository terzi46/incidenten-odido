import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const feature = await prisma.featureRequest.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feature" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { status, upvotes } = body;

    const feature = await prisma.featureRequest.update({
      where: { id },
      data: {
        status,
        upvotes: upvotes !== undefined ? { increment: upvotes } : undefined,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}
