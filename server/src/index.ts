import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './prisma/client.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n  MindCheck API listening on http://localhost:${env.PORT}`);
  console.log(`  Health check:  http://localhost:${env.PORT}/api/health`);
  console.log(`  Environment:   ${env.NODE_ENV}\n`);
});

/**
 * Close the HTTP server and drain the Prisma pool before exiting, so
 * in-flight requests finish and Neon doesn't log abandoned connections.
 */
async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Don't let a stuck connection block the deploy forever.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
