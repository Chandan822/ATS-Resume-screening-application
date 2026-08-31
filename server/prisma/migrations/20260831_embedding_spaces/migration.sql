-- Keep existing vectors. The unbounded pgvector type permits the 384-dimension
-- HF/ST spaces and the existing padded Gemini vectors to coexist.
ALTER TABLE "embeddings"
  ALTER COLUMN "vector" TYPE vector USING "vector"::vector;

ALTER TABLE "embeddings"
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "modelVersion" TEXT,
  ADD COLUMN "dimension" INTEGER,
  ADD COLUMN "textHash" TEXT;

-- Existing modelName values are preserved. Rows without reliable provider
-- metadata remain legacy/unknown and are ignored by compatibility resolution.
CREATE INDEX "embeddings_provider_modelVersion_idx"
  ON "embeddings" ("provider", "modelName", "modelVersion");
CREATE INDEX "embeddings_textHash_idx" ON "embeddings" ("textHash");
