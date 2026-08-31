import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  HF_API_KEY: process.env.HF_API_KEY || '',
  HF_EMBEDDING_MODEL: process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
  HF_EMBEDDING_MODEL_VERSION: process.env.HF_EMBEDDING_MODEL_VERSION || '1',
  LOCAL_EMBEDDING_MODEL: process.env.LOCAL_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
  LOCAL_EMBEDDING_MODEL_VERSION: process.env.LOCAL_EMBEDDING_MODEL_VERSION || '1',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
  GEMINI_EMBEDDING_MODEL_VERSION: process.env.GEMINI_EMBEDDING_MODEL_VERSION || '1',
};

export default env;
