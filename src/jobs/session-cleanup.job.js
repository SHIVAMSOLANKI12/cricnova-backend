/**
 * -----------------------------------------------------------------------------
 * File: session-cleanup.job.js
 * Description:
 * Scheduled Background Cleanup Job - Deletes Expired & Revoked Session Records
 *
 * Responsibilities:
 * - Purge expired session records (expiresAt < NOW)
 * - Purge revoked sessions older than 30 days
 * -----------------------------------------------------------------------------
 */

import prisma from '../core/database/prisma.client.js';
import logger from '../core/logger/index.js';

export async function runSessionCleanupJob() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deletedExpired = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const deletedRevoked = await prisma.session.deleteMany({
      where: {
        revokedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
    });

    return {
      job: 'session-cleanup',
      success: true,
      deletedExpiredCount: deletedExpired.count,
      deletedRevokedCount: deletedRevoked.count,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    logger.error('Error executing session cleanup job:', {
      error: error?.message ?? error,
      stack: error?.stack,
    });
    throw error;
  }
}

export default runSessionCleanupJob;
