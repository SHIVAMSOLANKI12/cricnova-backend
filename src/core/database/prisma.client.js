/**
 * -----------------------------------------------------------------------------
 * File: prisma.client.js
 * Description:
 * Centralized Prisma Client (Singleton)
 *
 * Responsibilities:
 * - Creates a single PrismaClient instance.
 * - Prevents multiple database connections.
 * - Enables query logging in development.
 * - Gracefully disconnects from PostgreSQL.
 *
 * NOTE:
 * Never instantiate PrismaClient anywhere else.
 * Always import this file.
 * -----------------------------------------------------------------------------
 */

import { PrismaClient } from '@prisma/client';
import env from '../../config/env.js';
import logger from '../logger/index.js';

const globalForPrisma = globalThis;

/**
 * Prisma Client Configuration
 */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            {
              emit: 'event',
              level: 'query',
            },
            {
              emit: 'stdout',
              level: 'error',
            },
            {
              emit: 'stdout',
              level: 'warn',
            },
          ]
        : [
            {
              emit: 'stdout',
              level: 'error',
            },
          ],
  });

/**
 * Development Query Logging
 */
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    logger.debug(`[Prisma Query] ${event.duration}ms | ${event.query}`);
  });
}

/**
 * Preserve Singleton During Hot Reload
 */
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful Shutdown
 */
const shutdown = async (signal) => {
  try {
    logger.info(`Received ${signal}. Closing Prisma connection...`);

    await prisma.$disconnect();

    logger.info('Prisma disconnected successfully.');

    process.exit(0);
  } catch (error) {
    logger.error('Error while disconnecting Prisma:', {
      error: error?.message ?? error,
      stack: error?.stack,
    });

    process.exit(1);
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

export default prisma;
