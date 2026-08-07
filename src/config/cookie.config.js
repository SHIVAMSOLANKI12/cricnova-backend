/**
 * -----------------------------------------------------------------------------
 * File: cookie.config.js
 * Description:
 * Secure Cookie Configuration
 * -----------------------------------------------------------------------------
 */

import env from './env.js';

const isProduction = env.NODE_ENV === 'production';

const cookieConfig = Object.freeze({
  refreshToken: {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction ? 'strict' : 'lax',

    path: '/api/v1/auth',

    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

export default cookieConfig;
