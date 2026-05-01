CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS vectors vector(1024);

CREATE INDEX IF NOT EXISTS incidents_vectors_hnsw_idx
  ON incidents
  USING hnsw (vectors vector_cosine_ops)
  WHERE vectors IS NOT NULL;
