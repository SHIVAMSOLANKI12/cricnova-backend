/**
 * -----------------------------------------------------------------------------
 * File: auth.validation.js
 * Description:
 * Enterprise Authentication Validation Schemas
 *
 * Responsibilities:
 * - Validate Send OTP Request
 * - Validate Verify OTP Request
 * - Validate Refresh Token Request
 * - Validate Logout Request
 *
 * NOTE:
 * Pure Zod Validation
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';
import otpConfig from '../../../config/otp.config.js';

/**
 * -------------------------------------------------------------------------
 * Phone Number
 * -------------------------------------------------------------------------
 */
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid mobile number.');

/**
 * -------------------------------------------------------------------------
 * OTP
 * -------------------------------------------------------------------------
 */
const otpSchema = z
  .string()
  .trim()
  .length(otpConfig.length, `OTP must be exactly ${otpConfig.length} digits.`)
  .regex(/^\d+$/, 'OTP must contain only digits.');

/**
 * -------------------------------------------------------------------------
 * Send OTP
 * -------------------------------------------------------------------------
 */
export const sendOtpSchema = z.object({
  mobile: phoneSchema,
});

/**
 * -------------------------------------------------------------------------
 * Verify OTP
 * -------------------------------------------------------------------------
 */
export const verifyOtpSchema = z.object({
  mobile: phoneSchema,

  otp: otpSchema,
});

/**
 * -------------------------------------------------------------------------
 * Refresh Token
 * -------------------------------------------------------------------------
 */
export const refreshTokenSchema = z.object({});

/**
 * -------------------------------------------------------------------------
 * Logout
 * -------------------------------------------------------------------------
 */
export const logoutSchema = z.object({});
