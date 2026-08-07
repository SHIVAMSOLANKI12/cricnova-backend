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
  .length(6, 'OTP must be exactly 6 digits.')
  .regex(/^\d{6}$/, 'OTP must contain only digits.');

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
