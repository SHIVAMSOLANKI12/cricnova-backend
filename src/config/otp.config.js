/**
 * -----------------------------------------------------------------------------
 * File: otp.config.js
 * Description:
 * OTP Configuration
 * -----------------------------------------------------------------------------
 */

import env from './env.js';

const otpConfig = Object.freeze({
  length: env.OTP_LENGTH,

  expiryMinutes: env.OTP_EXPIRY_MINUTES,

  maxAttempts: env.OTP_MAX_ATTEMPTS,

  resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
});

export default otpConfig;
