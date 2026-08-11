/**
 * -----------------------------------------------------------------------------
 * File: cloudinary.config.js
 * Description:
 * Centralized Cloudinary Configuration
 *
 * Responsibilities:
 * - Read validated Cloudinary configuration from env.js
 * - Expose provider-safe configuration
 * - Keep Cloudinary credentials out of business logic
 *
 * NOTE:
 * - No Express logic
 * - No database logic
 * - No upload logic
 * - API secret must never be exposed outside backend
 * -----------------------------------------------------------------------------
 */

import env from './env.js';

/**
 * -----------------------------------------------------------------------------
 * Configuration Validation
 * -----------------------------------------------------------------------------
 *
 * env.js already performs the production fail-fast validation.
 *
 * This additional guard protects this module if it is imported directly
 * in an unexpected environment.
 */
const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

/**
 * -----------------------------------------------------------------------------
 * Cloudinary Configuration
 * -----------------------------------------------------------------------------
 */
const cloudinaryConfig = Object.freeze({
  cloudName: env.CLOUDINARY_CLOUD_NAME ?? null,

  apiKey: env.CLOUDINARY_API_KEY ?? null,

  apiSecret: env.CLOUDINARY_API_SECRET ?? null,

  /**
   * Indicates whether Cloudinary credentials are currently available.
   *
   * Development/test may intentionally run without Cloudinary.
   */
  isConfigured,
});

/**
 * -----------------------------------------------------------------------------
 * Production Safety Guard
 * -----------------------------------------------------------------------------
 */
if (env.NODE_ENV === 'production' && !cloudinaryConfig.isConfigured) {
  throw new Error('Cloudinary configuration is required in production.');
}

export default cloudinaryConfig;
