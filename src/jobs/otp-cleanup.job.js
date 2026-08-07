/**
 * -----------------------------------------------------------------------------
 * File: otp-cleanup.job.js
 * Description:
 * Scheduled Background Cleanup Job - Deletes Expired & Stale OTP Records
 *
 * Responsibilities:
 * - Purge expired OTP verification records (expiresAt < NOW)
 * - Purge verified OTP records older than 24 hours
 * -----------------------------------------------------------------------------
 */

import prisma from '../core/database/prisma.client.js';

export async function runOtpCleanupJob() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const deletedExpired = await prisma.oTPVerification.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const deletedVerified = await prisma.oTPVerification.deleteMany({
      where: {
        verified: true,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    return {
      job: 'otp-cleanup',
      success: true,
      deletedExpiredCount: deletedExpired.count,
      deletedVerifiedCount: deletedVerified.count,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error('[JOB] Error executing OTP cleanup job:', error);
    throw error;
  }
}

export default runOtpCleanupJob;
