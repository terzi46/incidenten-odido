const JINA_EMBEDDINGS_URL = "https://api.jina.ai/v1/embeddings";
const JINA_EMBEDDINGS_MODEL = "jina-embeddings-v5-text-small";

type JinaEmbeddingTask = "retrieval.query" | "retrieval.passage";

type JinaEmbeddingResponse = {
  data: Array<{
    index: number;
    embedding: number[];
  }>;
};

export async function getTextEmbeddings(
  input: string[],
  task: JinaEmbeddingTask = "retrieval.passage",
): Promise<number[][]> {
  const apiKey = process.env.JINA_API_KEY;

  if (!apiKey) {
    throw new Error("JINA_API_KEY is not configured");
  }

  if (input.length === 0) {
    return [];
  }

  const response = await fetch(JINA_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: JINA_EMBEDDINGS_MODEL,
      task,
      normalized: true,
      input,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jina embeddings request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as JinaEmbeddingResponse;
  const embeddingsByInputIndex = new Map(
    payload.data.map((item) => [item.index, item.embedding]),
  );

  return input.map((_, index) => {
    const embedding = embeddingsByInputIndex.get(index);
    if (!embedding) {
      throw new Error(`Jina embeddings response did not include index ${index}`);
    }
    return embedding;
  });
}

export async function getTextEmbedding(
  input: string,
  task: JinaEmbeddingTask = "retrieval.query",
): Promise<number[]> {
  const [embedding] = await getTextEmbeddings([input], task);
  return embedding;
}
