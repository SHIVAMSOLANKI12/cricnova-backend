/**
 * -----------------------------------------------------------------------------
 * File: otp.provider.js
 * Description:
 * Enterprise OTP Provider
 *
 * Responsibilities:
 * - Generate cryptographically secure OTP
 * - Hash OTP before storing
 * - Verify OTP securely
 * - No business logic
 *
 * NOTE:
 * Never store plain OTP in database.
 * -----------------------------------------------------------------------------
 */

import crypto from 'crypto';

import otpConfig from '../../../config/otp.config.js';

class OTPProvider {
  /**
   * Generate Cryptographically Secure OTP
   *
   * Example:
   * 483921
   */
  static generateOTP() {
    const min = 10 ** (otpConfig.length - 1);

    const max = 10 ** otpConfig.length - 1;

    return crypto.randomInt(min, max + 1).toString();
  }

  /**
   * Hash OTP using SHA-256
   *
   * Database stores ONLY hash.
   */
  static hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verify OTP
   *
   * Uses constant-time comparison.
   */
  static verifyOTP(plainOTP, hashedOTP) {
    const incomingHash = this.hashOTP(plainOTP);

    return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashedOTP));
  }

  /**
   * Calculate Expiry Time
   */
  static getExpiryTime() {
    return new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);
  }
}

export default OTPProvider;
