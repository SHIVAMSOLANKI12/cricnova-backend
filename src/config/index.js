/**
 * -----------------------------------------------------------------------------
 * File: config/index.js
 * Description:
 * Centralized application configuration.
 *
 * NOTE:
 * - Environment variables are loaded/validated by env.js.
 * - This file provides the application's legacy config contract.
 * - Secrets are never exposed to frontend responses.
 * -----------------------------------------------------------------------------
 */

import env from './env.js';

const config = Object.freeze({
  env: env.NODE_ENV,

  port: env.PORT,

  apiPrefix: env.API_PREFIX ?? '/api/v1',

  db: {
    url: env.DATABASE_URL,
  },

  redis: {
    host: env.REDIS_HOST ?? '127.0.0.1',

    port: env.REDIS_PORT ?? 6379,

    password: env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: env.JWT_ACCESS_SECRET,

    expiresIn: env.JWT_ACCESS_EXPIRES_IN ?? '7d',

    refreshSecret: env.JWT_REFRESH_SECRET,

    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,

    apiKey: env.CLOUDINARY_API_KEY,

    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  cors: {
    origin: env.CORS_ORIGIN ?? '*',
  },

  logging: {
    level: env.LOG_LEVEL ?? 'info',
  },
});

export default config;
