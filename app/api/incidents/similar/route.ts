import { getTextEmbedding } from "@/app/lib/embeddings";
import { findSimilarIncidents } from "@/app/lib/incident-vectors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const subject = request.nextUrl.searchParams.get("subject")?.trim();

  if (!subject) {
    return NextResponse.json({ incidents: [] });
  }

  try {
    const embedding = await getTextEmbedding(subject, "retrieval.query");
    const incidents = await findSimilarIncidents(embedding, 5);

    return NextResponse.json({
      incidents: incidents.map((incident) => ({
        ...incident,
        datum: incident.datum.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to find similar incidents", error);
    return NextResponse.json(
      { error: "Similarity check is unavailable" },
      { status: 503 },
    );
  }
}
