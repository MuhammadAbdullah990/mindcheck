import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      // Controllers import the env module, which exits the process when
      // DATABASE_URL / JWT_SECRET are missing. Supplying throwaway values here
      // keeps that fail-fast behaviour in dev and production while letting the
      // unit tests run — no test ever opens a connection, because Prisma is
      // mocked. These are deliberately not real credentials.
      DATABASE_URL: 'postgresql://test:test@localhost:5432/mindcheck_test',
      JWT_SECRET: 'test-only-secret-not-used-for-any-real-signing',
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },
});
