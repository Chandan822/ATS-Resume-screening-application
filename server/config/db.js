import { PrismaClient } from '@prisma/client';
import env from './env.js';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Helper to check database connectivity for Phase 1 verification.
 */
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, status: 'Connected to PostgreSQL' };
  } catch (error) {
    return { connected: false, status: 'Database disconnected (Verify DATABASE_URL environment variable)', error: error.message };
  }
};

export default prisma;
