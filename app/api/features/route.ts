import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const features = await prisma.featureRequest.findMany({
      include: {
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(features);
  } catch (error) {
    console.error("Failed to fetch features:", error);
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, createdBy } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const feature = await prisma.featureRequest.create({
      data: {
        title,
        description,
        createdBy: createdBy || "Gebruiker",
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Failed to create feature:", error);
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}
