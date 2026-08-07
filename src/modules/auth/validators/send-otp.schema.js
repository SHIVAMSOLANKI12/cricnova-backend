/**
 * -----------------------------------------------------------------------------
 * File: send-otp.schema.js
 * Description:
 * Zod schema for Send OTP API.
 *
 * Responsibilities:
 * - Validate request body.
 * - Sanitize input.
 * - Reject unknown properties.
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';

/**
 * Indian Mobile Number Validation
 *
 * Accepts:
 * 9876543210
 *
 * Rejects:
 * +91...
 * 0987...
 * abc...
 */
const mobileSchema = z
  .string({
    required_error: 'Mobile number is required.',
    invalid_type_error: 'Mobile number must be a string.',
  })
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number.');

export const sendOtpSchema = {
  body: z
    .object({
      mobile: mobileSchema,
    })
    .strict(),
};

export default sendOtpSchema;
