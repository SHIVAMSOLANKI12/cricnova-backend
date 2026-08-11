/**
 * -----------------------------------------------------------------------------
 * File: refresh-token-cleanup.job.js
 * Description:
 * Scheduled Background Cleanup Job - Deletes Expired & Rotated Refresh Tokens
 *
 * Responsibilities:
 * - Purge expired refresh token records (expiresAt < NOW)
 * - Purge revoked/rotated refresh tokens older than 30 days
 * -----------------------------------------------------------------------------
 */

import prisma from '../core/database/prisma.client.js';
import logger from '../core/logger/index.js';

export async function runRefreshTokenCleanupJob() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deletedExpired = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const deletedRevoked = await prisma.refreshToken.deleteMany({
      where: {
        revokedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
    });

    return {
      job: 'refresh-token-cleanup',
      success: true,
      deletedExpiredCount: deletedExpired.count,
      deletedRevokedCount: deletedRevoked.count,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    logger.error('Error executing refresh token cleanup job:', {
      error: error?.message ?? error,
      stack: error?.stack,
    });
    throw error;
  }
}

export default runRefreshTokenCleanupJob;
