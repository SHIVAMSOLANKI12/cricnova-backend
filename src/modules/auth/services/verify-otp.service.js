/**
 * -----------------------------------------------------------------------------
 * File: verify-otp.service.js
 * Description:
 * Enterprise Verify OTP Service
 *
 * Responsibilities:
 * - Validate OTP Record
 * - Check OTP Expiry (Timezone Safe)
 * - Check Verification Attempt Limits
 * - Verify Cryptographic OTP Hash
 * - Safely Increment Verification Attempts on Failure
 * - Delegate Authentication & User Resolution to AuthTransactionService
 * - Transaction Tracing & Logging
 *
 * NOTE:
 * - No Express objects
 * - No HTTP responses
 * - Pure Business Logic
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';
import logger from '../../../common/logger/winston.js';

import { OTP_PURPOSE, AUTH_CONFIG } from '../constants/auth.constants.js';

import OTPProvider from '../providers/otp.provider.js';
import otpVerificationRepository from '../repositories/otp-verification.repository.js';
import authTransactionService from './auth-transaction.service.js';

class VerifyOtpService {
  /**
   * -------------------------------------------------------------------------
   * Increment OTP Attempts Safely
   * -------------------------------------------------------------------------
   */
  async incrementAttempts(otpRecord) {
    if (!otpRecord?.id) {
      return;
    }

    try {
      await otpVerificationRepository.incrementAttempts(otpRecord.id);
    } catch (error) {
      logger.error('Failed to increment OTP verification attempt count:', {
        otpRecordId: otpRecord.id,
        error: error.message,
      });
    }
  }

  /**
   * -------------------------------------------------------------------------
   * Validate OTP Expiry
   * -------------------------------------------------------------------------
   */
  validateOtpExpiry(otpRecord) {
    if (new Date(otpRecord.expiresAt).getTime() <= Date.now()) {
      throw new AppError({
        message: ErrorMessages.OTP_EXPIRED,
        code: ErrorCodes.OTP_EXPIRED,
        statusCode: 400,
      });
    }
  }

  /**
   * -------------------------------------------------------------------------
   * Validate OTP Attempts (Single Source of Truth: DB Record)
   * -------------------------------------------------------------------------
   */
  validateOtpAttempts(otpRecord) {
    const limit = otpRecord.maxAttempts ?? AUTH_CONFIG.OTP_MAX_ATTEMPTS;

    if (otpRecord.attemptCount >= limit) {
      throw new AppError({
        message: ErrorMessages.OTP_ATTEMPTS_EXCEEDED,
        code: ErrorCodes.OTP_ATTEMPTS_EXCEEDED,
        statusCode: 429,
      });
    }
  }

  /**
   * -------------------------------------------------------------------------
   * Execute OTP Verification & Authentication Delegation
   * -------------------------------------------------------------------------
   */
  async execute({ mobile, otp, purpose = OTP_PURPOSE.LOGIN, sessionPayload = {} }) {
    /**
     * -------------------------------------------------------------
     * Step 1: Find Latest Active OTP By Purpose
     * -------------------------------------------------------------
     */
    const otpRecord = await otpVerificationRepository.findLatestActiveOTP(mobile, purpose);

    if (!otpRecord) {
      throw new AppError({
        message: ErrorMessages.INVALID_OTP,
        code: ErrorCodes.INVALID_OTP,
        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------
     * Step 2: Timezone Safe Check OTP Expiry
     * -------------------------------------------------------------
     */
    this.validateOtpExpiry(otpRecord);

    /**
     * -------------------------------------------------------------
     * Step 3: Check Attempt Limit
     * -------------------------------------------------------------
     */
    this.validateOtpAttempts(otpRecord);

    /**
     * -------------------------------------------------------------
     * Step 4: Verify Cryptographic Hash
     * -------------------------------------------------------------
     */
    const valid = OTPProvider.verifyOTP(otp, otpRecord.otpHash);

    if (!valid) {
      try {
        await this.incrementAttempts(otpRecord);
      } catch (error) {
        /**
         * Don't fail authentication because attempt counter update failed.
         */
      }

      throw new AppError({
        message: ErrorMessages.INVALID_OTP,
        code: ErrorCodes.INVALID_OTP,
        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------
     * Step 5: Delegate Authentication & User Resolution to AuthTransactionService
     * -------------------------------------------------------------
     */
    logger.info('OTP verified successfully. Executing AuthTransactionService...', {
      mobile,
      purpose,
    });

    const authResult = await authTransactionService.execute({
      mobile,
      otpRecord,
      sessionPayload,
    });

    logger.info('Authentication transaction completed successfully.', {
      userId: authResult.user?.id,
      isNewUser: authResult.isNewUser,
    });

    return authResult;
  }
}

export default new VerifyOtpService();
