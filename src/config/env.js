/**
 * -----------------------------------------------------------------------------
 * File: env.js
 * Description:
 * Environment Configuration & Validation
 *
 * Responsibilities:
 * - Load environment variables
 * - Validate required variables
 * - Fail fast on invalid configuration
 * - Export immutable configuration
 *
 * Enterprise Features:
 * - Zod validation
 * - Type coercion
 * - Default values
 * - Clear startup errors
 * -----------------------------------------------------------------------------
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * -----------------------------------------------------------------------------
 * Environment Schema
 * -----------------------------------------------------------------------------
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters.'),

  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters.'),

  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),

  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(5),

  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),

  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(30),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

/**
 * -----------------------------------------------------------------------------
 * Parse & Validate
 * -----------------------------------------------------------------------------
 */

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid Environment Configuration\n');

  parsed.error.issues.forEach((issue) => {
    console.error(`• ${issue.path.join('.')}: ${issue.message}`);
  });

  console.error('\nApplication startup aborted.\n');

  process.exit(1);
}

/**
 * -----------------------------------------------------------------------------
 * Immutable Environment Object
 * -----------------------------------------------------------------------------
 */

const env = Object.freeze(parsed.data);

export default env;
