/**
 * -----------------------------------------------------------------------------
 * File: send-otp.service.js
 * Description:
 * Enterprise Send OTP Service
 *
 * Responsibilities:
 * - Business validations
 * - OTP generation
 * - Cooldown validation
 * - OTP persistence
 * - SMS dispatch
 *
 * No Express req/res objects.
 * No HTTP response generation.
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';

import otpConfig from '../../../config/otp.config.js';

import OTPProvider from '../providers/otp.provider.js';
import SMSProvider from '../providers/sms.provider.js';

import userRepository from '../repositories/user.repository.js';
import otpVerificationRepository from '../repositories/otp-verification.repository.js';

class SendOtpService {
  async execute({ mobile }) {
    /**
     * -------------------------------------------------------------------------
     * Step 1
     * Check Existing User
     * -------------------------------------------------------------------------
     */

    const user = await userRepository.findByMobile(mobile);

    /**
     * -------------------------------------------------------------------------
     * Step 2
     * Check Active OTP
     * -------------------------------------------------------------------------
     */

    const activeOTP = await otpVerificationRepository.findLatestActiveOTP(mobile, 'LOGIN');

    if (activeOTP) {
      const cooldown = otpConfig.resendCooldownSeconds * 1000;

      const elapsed = Date.now() - new Date(activeOTP.createdAt).getTime();

      if (elapsed < cooldown) {
        throw new AppError({
          message: 'Please wait before requesting another OTP.',
          code: ErrorCodes.BAD_REQUEST,
          statusCode: 429,
        });
      }
    }

    /**
     * -------------------------------------------------------------------------
     * Step 3
     * Generate OTP
     * -------------------------------------------------------------------------
     */

    const otp = OTPProvider.generateOTP();

    const otpHash = OTPProvider.hashOTP(otp);

    const expiresAt = OTPProvider.getExpiryTime();

    /**
     * -------------------------------------------------------------------------
     * Step 4
     * Save OTP
     * -------------------------------------------------------------------------
     */

    await otpVerificationRepository.create({
      target: mobile, // ✅ Schema field: target
      targetType: 'PHONE', // ✅ Schema enum: PHONE
      otpHash,
      purpose: 'LOGIN', // ✅ Schema enum: LOGIN
      expiresAt,
      attemptCount: 0, // ✅ Schema field: attemptCount
      userId: user?.id ?? null, // ✅ Nullable foreign key
    });

    /**
     * -------------------------------------------------------------------------
     * Step 5
     * Send SMS
     * -------------------------------------------------------------------------
     */

    await SMSProvider.sendOTP({
      mobile,

      message: `Your CricNova OTP is ${otp}. It is valid for ${otpConfig.expiryMinutes} minutes.`,
    });

    /**
     * -------------------------------------------------------------------------
     * Step 6
     * Response
     * -------------------------------------------------------------------------
     */

    return {
      success: true,

      expiresIn: otpConfig.expiryMinutes * 60,

      resendAfter: otpConfig.resendCooldownSeconds,
    };
  }
}

export default new SendOtpService();
