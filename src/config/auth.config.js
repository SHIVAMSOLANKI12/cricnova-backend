/**
 * -----------------------------------------------------------------------------
 * File: auth.config.js
 * Description:
 * Authentication Configuration
 *
 * Responsibilities:
 * - JWT Access Token
 * - JWT Refresh Token
 * - Token Expiry
 * -----------------------------------------------------------------------------
 */

import env from './env.js';

const authConfig = Object.freeze({
  accessToken: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  },

  refreshToken: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
});

export default authConfig;
