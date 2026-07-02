import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

/**
 * Fallback L2-Normalized Unit Vector Generator
 * Ensures mathematical cosine similarity works reliably even without API key
 */
export const fallbackNormalizedVector = (text, dimensions = 768) => {
  const vector = new Array(dimensions).fill(0);
  if (!text || typeof text !== 'string') return vector;

  const words = text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Calculate L2 Norm
  let sumSquares = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSquares += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSquares);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
};

/**
 * Main Text Embedding Generator (Gemini text-embedding-004 + Fallback)
 */
export const generateTextEmbedding = async (text) => {
  if (!text || text.trim().length === 0) {
    return fallbackNormalizedVector('', 768);
  }

  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return fallbackNormalizedVector(text, 768);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.warn(`[Embedding Generator Warning] ${err.message}. Using normalized vector fallback.`);
    return fallbackNormalizedVector(text, 768);
  }
};
