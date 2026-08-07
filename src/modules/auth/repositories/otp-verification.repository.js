/**
 * -----------------------------------------------------------------------------
 * File: otp-verification.repository.js
 * Description:
 * Enterprise OTP Verification Repository
 *
 * Responsibilities:
 * - OTP database operations only
 * - Transaction aware
 * - Repository pattern
 * - No business logic
 *
 * NOTE:
 * All methods support Prisma Transaction Client.
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class OTPVerificationRepository extends BaseRepository {
  constructor() {
    super('oTPVerification');
  }

  /**
   * -------------------------------------------------------------------------
   * Find Latest Active OTP
   * -------------------------------------------------------------------------
   */
  async findLatestActiveOTP(mobile, purpose, tx = null) {
    const client = tx ? tx.oTPVerification : this.model;

    return client.findFirst({
      where: {
        target: mobile,

        targetType: 'PHONE',

        purpose,

        verifiedAt: null,

        status: 'PENDING',

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Find OTP By Hash
   * -------------------------------------------------------------------------
   */
  async findByOTPHash(otpHash, tx = null) {
    const client = tx ? tx.oTPVerification : this.model;

    return client.findFirst({
      where: {
        otpHash,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Mark OTP Verified
   * -------------------------------------------------------------------------
   */
  async markVerified(id, tx = null) {
    return this.update(
      {
        id,
      },

      {
        verifiedAt: new Date(),
      },

      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Increment Verification Attempts
   * -------------------------------------------------------------------------
   */
  async incrementAttempts(id, tx = null) {
    const client = tx ? tx.oTPVerification : this.model;

    return client.update({
      where: {
        id,
      },

      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke Expired OTPs
   * -------------------------------------------------------------------------
   */
  async revokeExpiredOTPs(tx = null) {
    const client = tx ? tx.oTPVerification : this.model;

    return client.updateMany({
      where: {
        verifiedAt: null,

        status: 'PENDING',

        expiresAt: {
          lt: new Date(),
        },
      },

      data: {
        status: 'EXPIRED',
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Delete Old Verified OTPs
   *
   * Cleanup Job Support
   * -------------------------------------------------------------------------
   */
  async deleteVerifiedBefore(date, tx = null) {
    return this.deleteMany(
      {
        verifiedAt: {
          lt: date,
        },
      },

      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Count Active OTPs
   * -------------------------------------------------------------------------
   */
  async countActiveOTPs(mobile, purpose, tx = null) {
    return this.count(
      {
        target: mobile,

        targetType: 'PHONE',

        purpose,

        revokedAt: null,

        verifiedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },

      tx
    );
  }
}

export default new OTPVerificationRepository();
