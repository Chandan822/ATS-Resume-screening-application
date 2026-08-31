import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EmbeddingProviderError,
  IncompatibleEmbeddingError,
  calculateCosineSimilarity,
  contentHash,
  embeddingsCompatible,
  findCommonEmbeddingSpace,
  resolveComparisonPair,
} from '../services/embedding.service.js';

const entityA = { id: 'job-1', type: 'job', text: 'Backend engineer' };
const entityB = { id: 'resume-1', type: 'resume', text: 'Node.js engineer' };

const embedding = (provider, vector = [1, 0], overrides = {}) => ({
  provider,
  model: provider === 'gemini' ? 'text-embedding-004' : 'sentence-transformers/all-MiniLM-L6-v2',
  modelVersion: '1',
  dimension: vector.length,
  vector,
  ...overrides,
});

test('reuses existing HF embeddings without generating new vectors', async () => {
  let generated = 0;
  const hfJob = embedding('huggingface');
  const hfResume = embedding('huggingface', [0.8, 0.2]);
  const result = await resolveComparisonPair({
    entityA,
    entityB,
    storedA: [hfJob],
    storedB: [hfResume],
    ensureEmbedding: async () => { generated += 1; },
  });
  assert.equal(result.provider, 'huggingface');
  assert.equal(generated, 0);
});

test('reuses common Gemini embeddings instead of generating HF', async () => {
  let generated = 0;
  const result = await resolveComparisonPair({
    entityA,
    entityB,
    storedA: [embedding('huggingface'), embedding('gemini')],
    storedB: [embedding('gemini', [0.7, 0.3])],
    ensureEmbedding: async () => { generated += 1; },
  });
  assert.equal(result.provider, 'gemini');
  assert.equal(generated, 0);
});

test('prefers HF when several common embedding spaces exist', () => {
  const common = findCommonEmbeddingSpace(
    [embedding('gemini'), embedding('huggingface')],
    [embedding('gemini'), embedding('huggingface')],
  );
  assert.equal(common.provider, 'huggingface');
});

test('generates only the missing HF embedding when HF already exists on one side', async () => {
  const hfJob = embedding('huggingface');
  const generated = [];
  const result = await resolveComparisonPair({
    entityA,
    entityB,
    storedA: [hfJob],
    storedB: [embedding('gemini')],
    ensureEmbedding: async (entity, provider) => {
      generated.push(`${entity.id}:${provider}`);
      return entity.id === entityA.id ? hfJob : embedding('huggingface', [0.8, 0.2]);
    },
  });
  assert.equal(result.provider, 'huggingface');
  assert.deepEqual(generated, ['job-1:huggingface', 'resume-1:huggingface']);
});

test('falls back as a pair to local Sentence Transformers when HF is unavailable', async () => {
  const generated = [];
  const result = await resolveComparisonPair({
    entityA,
    entityB,
    storedA: [embedding('huggingface')],
    storedB: [embedding('gemini')],
    ensureEmbedding: async (entity, provider) => {
      generated.push(`${entity.id}:${provider}`);
      if (provider === 'huggingface') throw new EmbeddingProviderError('huggingface', 'unavailable');
      if (provider === 'sentence-transformers') return embedding(provider, entity.id === entityA.id ? [1, 0] : [0.8, 0.2]);
      throw new Error('Gemini should not be reached');
    },
  });
  assert.equal(result.provider, 'sentence-transformers');
  assert.deepEqual(generated, [
    'job-1:huggingface',
    'resume-1:huggingface',
    'job-1:sentence-transformers',
    'resume-1:sentence-transformers',
  ]);
});

test('rejects incompatible provider/model/version/dimension pairs', () => {
  assert.equal(embeddingsCompatible(embedding('huggingface'), embedding('gemini')), false);
  assert.equal(embeddingsCompatible(embedding('huggingface'), embedding('huggingface', [1, 0, 0])), false);
  assert.throws(
    () => calculateCosineSimilarity([1, 0], [1, 0, 0]),
    IncompatibleEmbeddingError,
  );
});

test('content hashes invalidate the cache when source text changes', () => {
  assert.notEqual(contentHash('Resume version one'), contentHash('Resume version two'));
  assert.equal(contentHash('Resume version one'), contentHash('Resume version one'));
});
