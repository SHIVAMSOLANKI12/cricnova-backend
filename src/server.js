/**
 * -----------------------------------------------------------------------------
 * File: server.js
 * Description:
 * HTTP Server Entrypoint & Process Lifecycle Manager
 *
 * Responsibilities:
 * - Bootstraps Node.js HTTP Server with Express App
 * - Handles Uncaught Exceptions & Unhandled Rejections
 * - Manages Enterprise Graceful Shutdown (SIGINT / SIGTERM)
 * -----------------------------------------------------------------------------
 */

import http from 'http';
import app from './app.js';
import env from './config/env.js';
import logger from './common/logger/winston.js';
import prisma from './core/database/prisma.client.js';

const PORT = env.PORT;

/**
 * -----------------------------------------------------------------------------
 * 1. Global Process Uncaught Exception Handler
 * -----------------------------------------------------------------------------
 */
process.on('uncaughtException', (error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down process...', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

/**
 * -----------------------------------------------------------------------------
 * 2. Create & Start HTTP Server
 * -----------------------------------------------------------------------------
 */
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 CricNova Backend Engine running on port ${PORT} [${env.NODE_ENV}]`);
  logger.info(`🏥 Health Check available at http://localhost:${PORT}/health`);
});

/**
 * -----------------------------------------------------------------------------
 * 3. Global Unhandled Rejection Handler
 * -----------------------------------------------------------------------------
 */
process.on('unhandledRejection', (reason, _promise) => {
  logger.error('💥 UNHANDLED PROMISE REJECTION! Shutting down server...', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : null,
  });

  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * -----------------------------------------------------------------------------
 * 4. Enterprise Graceful Shutdown Manager
 * -----------------------------------------------------------------------------
 */
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info(`⚠️ ${signal} received. Initiating graceful shutdown...`);

  // Force exit after 10 seconds if graceful shutdown gets stuck
  const forceExitTimeout = setTimeout(() => {
    logger.error('💥 Forced shutdown timed out (10s). Terminating process immediately.');
    process.exit(1);
  }, 10000);

  forceExitTimeout.unref();

  server.close(async () => {
    logger.info('🔒 HTTP Server closed. No longer accepting new connections.');

    try {
      // Disconnect Database
      await prisma.$disconnect();
      logger.info('💾 PostgreSQL database connection disconnected cleanly.');

      logger.info('👋 CricNova Process terminated gracefully.');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during database disconnect on shutdown:', error);
      process.exit(1);
    }
  });
};

/**
 * Listen for Termination Signals
 */
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
