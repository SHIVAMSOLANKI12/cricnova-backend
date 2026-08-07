/**
 * -----------------------------------------------------------------------------
 * File: verify-otp.schema.js
 * Description:
 * Zod Validation Schema for Verify OTP API
 *
 * Responsibilities:
 * - Validate incoming request body
 * - Reject unknown properties
 * - Sanitize input
 * - Enforce enterprise validation rules
 *
 * Endpoint:
 * POST /api/v1/auth/verify-otp
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';
import env from '../../../config/env.js';

/**
 * ---------------------------------------------------------------------------
 * Mobile Number Validation
 * ---------------------------------------------------------------------------
 */
const mobileSchema = z
  .string({
    required_error: 'Mobile number is required.',
    invalid_type_error: 'Mobile number must be a string.',
  })
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number.');

/**
 * ---------------------------------------------------------------------------
 * OTP Validation
 * ---------------------------------------------------------------------------
 */
const otpLength = env.OTP_LENGTH;

const otpSchema = z
  .string({
    required_error: 'OTP is required.',
    invalid_type_error: 'OTP must be a string.',
  })
  .trim()
  .length(otpLength, `OTP must be exactly ${otpLength} digits.`)
  .regex(/^\d+$/, 'OTP must contain only numeric digits.');

/**
 * ---------------------------------------------------------------------------
 * Verify OTP Request Schema
 * ---------------------------------------------------------------------------
 */
export const verifyOtpSchema = {
  body: z
    .object({
      mobile: mobileSchema,
      otp: otpSchema,
    })
    .strict(),
};

export default verifyOtpSchema;
