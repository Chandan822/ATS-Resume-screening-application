import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/db.js';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EMBEDDING_PROVIDER_PRIORITY = ['huggingface', 'sentence-transformers', 'gemini'];
const DEFAULT_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const DEFAULT_VERSION = '1';
const GEMINI_STORAGE_DIMENSION = 1536;

export class EmbeddingProviderError extends Error {
  constructor(provider, message, cause) {
    super(message);
    this.name = 'EmbeddingProviderError';
    this.provider = provider;
    this.cause = cause;
  }
}

export class IncompatibleEmbeddingError extends Error {
  constructor(message = 'The embeddings belong to incompatible vector spaces.') {
    super(message);
    this.name = 'IncompatibleEmbeddingError';
    this.statusCode = 422;
  }
}

export class EmbeddingProvidersUnavailableError extends Error {
  constructor() {
    super('Embedding provider unavailable. Please try again later.');
    this.name = 'EmbeddingProvidersUnavailableError';
    this.statusCode = 503;
  }
}

const configured = (value) => typeof value === 'string' && value.trim() !== '';

const getApiKey = (name) => {
  const value = process.env[name] || env[name];
  if (!configured(value) || value.startsWith('your_')) return null;
  return value.trim();
};

export const providerDefinitions = () => ({
  huggingface: {
    provider: 'huggingface',
    model: process.env.HF_EMBEDDING_MODEL || env.HF_EMBEDDING_MODEL || DEFAULT_MODEL,
    version: process.env.HF_EMBEDDING_MODEL_VERSION || env.HF_EMBEDDING_MODEL_VERSION || DEFAULT_VERSION,
  },
  'sentence-transformers': {
    provider: 'sentence-transformers',
    model: process.env.LOCAL_EMBEDDING_MODEL || env.LOCAL_EMBEDDING_MODEL || DEFAULT_MODEL,
    version: process.env.LOCAL_EMBEDDING_MODEL_VERSION || env.LOCAL_EMBEDDING_MODEL_VERSION || DEFAULT_VERSION,
  },
  gemini: {
    provider: 'gemini',
    model: process.env.GEMINI_EMBEDDING_MODEL || env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    version: process.env.GEMINI_EMBEDDING_MODEL_VERSION || env.GEMINI_EMBEDDING_MODEL_VERSION || DEFAULT_VERSION,
  },
});

export const contentHash = (text) => createHash('sha256').update(String(text || ''), 'utf8').digest('hex');

export const embeddingSpaceKey = (embedding) => (
  embedding?.provider && embedding?.model && embedding?.modelVersion
    ? `${embedding.provider}:${embedding.model}:${embedding.modelVersion}`
    : null
);

export const embeddingsCompatible = (a, b) => Boolean(
  a && b
  && a.provider === b.provider
  && a.model === b.model
  && a.modelVersion === b.modelVersion
  && Number(a.dimension) === Number(b.dimension)
  && Array.isArray(a.vector)
  && Array.isArray(b.vector)
  && a.vector.length === b.vector.length
);

const providerRank = (provider) => {
  const index = EMBEDDING_PROVIDER_PRIORITY.indexOf(provider);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

/** Select the highest-priority compatible space already present on both sides. */
export const findCommonEmbeddingSpace = (embeddingsA = [], embeddingsB = []) => {
  const candidates = [];
  for (const a of embeddingsA) {
    for (const b of embeddingsB) {
      if (embeddingsCompatible(a, b)) {
        candidates.push({ key: embeddingSpaceKey(a), provider: a.provider, a, b });
      }
    }
  }
  candidates.sort((a, b) => providerRank(a.provider) - providerRank(b.provider));
  return candidates[0] || null;
};

const parseVector = (value) => {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value !== 'string') return [];
  return value.replaceAll('[', '').replaceAll(']', '').split(',').filter(Boolean).map(Number);
};

const normalizeStoredEmbedding = (row, sourceUpdatedAt) => {
  const vector = parseVector(row.vector);
  let provider = row.provider;
  let model = row.modelName;
  let modelVersion = row.modelVersion;
  let dimension = row.dimension || vector.length;

  // Rows written by the old service contain the actual Gemini model name but no
  // provider metadata. They are safe to identify; unknown legacy rows remain
  // unusable rather than being guessed into a vector space.
  if (!provider && row.modelName === 'gemini-text-embedding-004') {
    provider = 'gemini';
    model = 'text-embedding-004';
    modelVersion = '1';
    // The former service called this Gemini model at its default 768 model
    // dimension, then padded its stored pgvector to 1536 slots.
    dimension = 768;
  }

  if (!provider || !model || !modelVersion || !vector.length) return null;

  // A legacy row has no content hash. Reuse it only if the source entity has
  // not changed after the vector was written.
  if (!row.textHash && sourceUpdatedAt && new Date(row.updatedAt) < new Date(sourceUpdatedAt)) return null;

  return {
    id: row.id,
    vector,
    provider,
    model,
    modelVersion,
    dimension: Number(dimension),
    textHash: row.textHash || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const entityWhereQuery = (entity) => {
  if (entity.type === 'job') {
    return prisma.$queryRaw`
      SELECT id, vector::text AS vector, provider, "modelName", "modelVersion", dimension,
             "textHash", "createdAt", "updatedAt"
      FROM embeddings
      WHERE "entityType" = 'JOB_DESCRIPTION'::"EmbeddingEntityType" AND "jobId" = ${entity.id}
      ORDER BY "updatedAt" DESC
    `;
  }
  return prisma.$queryRaw`
    SELECT id, vector::text AS vector, provider, "modelName", "modelVersion", dimension,
           "textHash", "createdAt", "updatedAt"
    FROM embeddings
    WHERE "entityType" = 'RESUME'::"EmbeddingEntityType" AND "resumeVersionId" = ${entity.id}
    ORDER BY "updatedAt" DESC
  `;
};

export const getStoredEmbeddings = async (entity) => {
  const rows = await entityWhereQuery(entity);
  return rows.map((row) => normalizeStoredEmbedding(row, entity.updatedAt)).filter(Boolean);
};

const getCachedEmbeddingForText = async (hash, definition) => {
  const rows = await prisma.$queryRaw`
    SELECT id, vector::text AS vector, provider, "modelName", "modelVersion", dimension,
           "textHash", "createdAt", "updatedAt"
    FROM embeddings
    WHERE "textHash" = ${hash}
      AND provider = ${definition.provider}
      AND "modelName" = ${definition.model}
      AND "modelVersion" = ${definition.version}
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `;
  return rows.map((row) => normalizeStoredEmbedding(row)).find(Boolean) || null;
};

const vectorLiteral = (vector) => `[${vector.map((value) => Number(value)).join(',')}]`;

const embeddingId = (entity, metadata, hash) => {
  const raw = `${entity.type}:${entity.id}:${metadata.provider}:${metadata.model}:${metadata.modelVersion}:${hash}`;
  return `emb_${createHash('sha256').update(raw).digest('hex')}`;
};

export const saveEmbedding = async (entity, embedding) => {
  const id = embeddingId(entity, embedding, embedding.textHash);
  const entityType = entity.type === 'job' ? 'JOB_DESCRIPTION' : 'RESUME';
  const vector = vectorLiteral(embedding.vector);

  if (entity.type === 'job') {
    await prisma.$executeRaw`
      INSERT INTO embeddings
        (id, "entityType", "jobId", vector, provider, "modelName", "modelVersion", dimension, "textHash", "createdAt", "updatedAt")
      VALUES
        (${id}, ${entityType}::"EmbeddingEntityType", ${entity.id}, ${vector}::vector,
         ${embedding.provider}, ${embedding.model}, ${embedding.modelVersion}, ${embedding.dimension}, ${embedding.textHash}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO embeddings
        (id, "entityType", "candidateId", "resumeVersionId", vector, provider, "modelName", "modelVersion", dimension, "textHash", "createdAt", "updatedAt")
      VALUES
        (${id}, ${entityType}::"EmbeddingEntityType", ${entity.candidateId || null}, ${entity.id}, ${vector}::vector,
         ${embedding.provider}, ${embedding.model}, ${embedding.modelVersion}, ${embedding.dimension}, ${embedding.textHash}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const stored = await getStoredEmbeddings(entity);
  return stored.find((item) => item.id === id) || embedding;
};

const normalizeProviderVector = (definition, vector) => {
  if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(Number(value)))) {
    throw new Error('Embedding provider returned an invalid vector.');
  }
  const values = vector.map(Number);
  return {
    vector: values,
    provider: definition.provider,
    model: definition.model,
    modelVersion: definition.version,
    dimension: values.length,
  };
};

const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const flattenEmbeddingResponse = (payload) => {
  const value = payload?.embeddings || payload?.embedding || payload;
  if (!Array.isArray(value)) return [];
  if (value.length > 0 && Array.isArray(value[0])) return flattenEmbeddingResponse(value[0]);
  return value;
};

const generateHuggingFace = async (text, definition) => {
  const apiKey = getApiKey('HF_API_KEY');
  if (!apiKey) throw new EmbeddingProviderError('huggingface', 'Hugging Face is not configured.');

  try {
    const response = await fetchWithTimeout(
      `https://router.huggingface.co/hf-inference/models/${definition.model}/pipeline/feature-extraction`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: [text], options: { wait_for_model: true } }),
      },
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const vector = flattenEmbeddingResponse(payload);
    if (!vector.length) throw new Error('empty response');
    return normalizeProviderVector(definition, vector);
  } catch (error) {
    throw new EmbeddingProviderError('huggingface', 'Hugging Face unavailable.', error);
  }
};

let geminiModel;
const generateGemini = async (text, definition) => {
  const apiKey = getApiKey('GEMINI_API_KEY');
  if (!apiKey) throw new EmbeddingProviderError('gemini', 'Gemini is not configured.');

  try {
    if (!geminiModel) {
      const genAI = new GoogleGenerativeAI(apiKey);
      geminiModel = genAI.getGenerativeModel({ model: definition.model });
    }
    const result = await geminiModel.embedContent(text);
    const values = result?.embedding?.values || [];
    if (!values.length) throw new Error('empty response');

    // Preserve the existing pgvector storage convention so known legacy
    // Gemini vectors remain comparable after the schema migration. `dimension`
    // still records the model's real output dimension, not padded storage size.
    const vector = [...values, ...new Array(Math.max(0, GEMINI_STORAGE_DIMENSION - values.length)).fill(0)];
    return { ...normalizeProviderVector(definition, vector), dimension: values.length };
  } catch (error) {
    throw new EmbeddingProviderError('gemini', 'Gemini unavailable.', error);
  }
};

let localWorker;
let localWorkerQueue = [];
let localWorkerRequest;

const failLocalWorker = (error) => {
  const pending = [localWorkerRequest, ...localWorkerQueue].filter(Boolean);
  localWorkerQueue = [];
  localWorkerRequest = null;
  localWorker = null;
  for (const request of pending) request.reject(error);
};

const pumpLocalWorker = () => {
  if (!localWorker || localWorkerRequest || localWorkerQueue.length === 0) return;
  localWorkerRequest = localWorkerQueue.shift();
  localWorker.stdin.write(`${JSON.stringify({ text: localWorkerRequest.text })}\n`);
};

const getLocalWorker = () => {
  if (localWorker) return localWorker;
  const python = process.env.LOCAL_EMBEDDING_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const script = path.resolve(__dirname, '../utils/local_embedding_worker.py');
  const child = spawn(python, [script], {
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const lines = createInterface({ input: child.stdout });
  lines.on('line', (line) => {
    if (!localWorkerRequest) return;
    const request = localWorkerRequest;
    localWorkerRequest = null;
    try {
      const result = JSON.parse(line);
      if (result.error) request.reject(new Error(result.error));
      else request.resolve(result.embedding);
    } catch (error) {
      request.reject(error);
    }
    pumpLocalWorker();
  });
  child.stderr.on('data', () => {}); // Never echo Python/model output, which may contain environment details.
  child.on('error', (error) => failLocalWorker(error));
  child.on('exit', (code) => {
    if (code !== 0) failLocalWorker(new Error(`Local embedding worker exited (${code}).`));
    localWorker = null;
  });
  localWorker = child;
  return child;
};

const generateLocal = async (text, definition) => {
  try {
    getLocalWorker();
    const vector = await new Promise((resolve, reject) => {
      localWorkerQueue.push({ text, resolve, reject });
      pumpLocalWorker();
    });
    return normalizeProviderVector(definition, vector);
  } catch (error) {
    throw new EmbeddingProviderError('sentence-transformers', 'Local Sentence Transformer unavailable.', error);
  }
};

export const generateEmbedding = async ({ text, provider }) => {
  const definitions = providerDefinitions();
  const selected = provider || EMBEDDING_PROVIDER_PRIORITY[0];
  const definition = definitions[selected];
  if (!definition) throw new EmbeddingProviderError(selected, 'Unknown embedding provider.');

  if (selected === 'huggingface') return generateHuggingFace(text, definition);
  if (selected === 'sentence-transformers') return generateLocal(text, definition);
  return generateGemini(text, definition);
};

const getOrCreateEmbeddingForProvider = async (entity, text, provider) => {
  const hash = contentHash(text);
  const existing = await getStoredEmbeddings(entity);
  const definition = providerDefinitions()[provider];
  const cached = existing.find((item) => (
    item.textHash === hash
    && (!definition || (
      item.provider === definition.provider
      && item.model === definition.model
      && item.modelVersion === definition.version
    ))
  ));
  if (cached) {
    console.info(`[Embedding] Using existing ${cached.provider} embedding.`);
    return cached;
  }

  // Reuse a vector generated for identical source text on another entity. We
  // still save a separate entity row so lifecycle and ownership remain clear.
  const sharedCached = await getCachedEmbeddingForText(hash, definition);
  if (sharedCached) {
    console.info(`[Embedding] Reusing cached ${sharedCached.provider} embedding.`);
    return saveEmbedding(entity, { ...sharedCached, textHash: hash });
  }

  const generated = await generateEmbedding({ text, provider });
  const embedding = { ...generated, textHash: hash };
  console.info(`[Embedding] Generating ${embedding.provider} embedding.`);
  return saveEmbedding(entity, embedding);
};

export const getOrCreateEmbedding = async (entity, text, provider) => {
  if (provider) return getOrCreateEmbeddingForProvider(entity, text, provider);

  const hash = contentHash(text);
  const existing = await getStoredEmbeddings(entity);
  for (const providerName of EMBEDDING_PROVIDER_PRIORITY) {
    const definition = providerDefinitions()[providerName];
    const cached = existing.find((item) => (
      item.textHash === hash
      && item.provider === definition.provider
      && item.model === definition.model
      && item.modelVersion === definition.version
    ));
    if (cached) {
      console.info(`[Embedding] Using existing ${cached.provider} embedding.`);
      return cached;
    }
  }

  let lastError;
  for (const providerName of EMBEDDING_PROVIDER_PRIORITY) {
    try {
      return await getOrCreateEmbeddingForProvider(entity, text, providerName);
    } catch (error) {
      lastError = error;
      if (error instanceof EmbeddingProviderError) console.warn(`[Embedding] ${error.provider} unavailable.`);
    }
  }
  throw lastError || new EmbeddingProvidersUnavailableError();
};

const providerOrder = (preferredProvider) => preferredProvider
  ? [preferredProvider, ...EMBEDDING_PROVIDER_PRIORITY.filter((name) => name !== preferredProvider)]
  : EMBEDDING_PROVIDER_PRIORITY;

/**
 * Resolve a comparison as a pair. A provider is selected first, then both
 * sides are loaded/generated in that same space. Independent fallback calls
 * are deliberately not used here.
 */
export const resolveComparisonPair = async ({
  entityA,
  entityB,
  storedA = [],
  storedB = [],
  ensureEmbedding,
  preferredProvider,
}) => {
  const common = findCommonEmbeddingSpace(storedA, storedB);
  if (common) {
    console.info(`[Embedding] Comparing ${common.provider} embeddings.`);
    return { similarity: calculateCosineSimilarity(common.a.vector, common.b.vector), provider: common.provider, a: common.a, b: common.b };
  }

  console.info('[Embedding] No common embedding space found.');
  let lastError;
  for (const provider of providerOrder(preferredProvider)) {
    try {
      const [a, b] = await Promise.all([
        ensureEmbedding(entityA, provider),
        ensureEmbedding(entityB, provider),
      ]);
      if (!embeddingsCompatible(a, b)) throw new IncompatibleEmbeddingError();
      console.info(`[Embedding] Comparing ${provider} embeddings.`);
      return { similarity: calculateCosineSimilarity(a.vector, b.vector), provider, a, b };
    } catch (error) {
      lastError = error;
      if (error instanceof EmbeddingProviderError) {
        console.warn(`[Embedding] ${error.provider} unavailable.`);
      }
    }
  }
  throw lastError instanceof IncompatibleEmbeddingError ? lastError : new EmbeddingProvidersUnavailableError();
};

export const compareEntities = async (entityA, entityB, { preferredProvider } = {}) => {
  const [storedA, storedB] = await Promise.all([
    getStoredEmbeddings(entityA),
    getStoredEmbeddings(entityB),
  ]);
  return resolveComparisonPair({
    entityA,
    entityB,
    storedA,
    storedB,
    preferredProvider,
    ensureEmbedding: (entity, provider) => getOrCreateEmbedding(entity, entity.text, provider),
  });
};

export const calculateCosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length === 0 || vectorA.length !== vectorB.length) {
    throw new IncompatibleEmbeddingError('Cannot calculate similarity for vectors with different dimensions.');
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i += 1) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return Math.min(Math.max(dotProduct / denominator, 0), 1);
};

export const resetEmbeddingRuntimeForTests = () => {
  if (localWorker) localWorker.kill();
  localWorker = null;
  localWorkerQueue = [];
  localWorkerRequest = null;
  geminiModel = undefined;
};
