import { PrismaClient } from '@prisma/client';

/**
 * Single Prisma instance. Without caching on globalThis, `tsx watch` would
 * open a fresh connection pool on every file save until the database refuses
 * new connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
