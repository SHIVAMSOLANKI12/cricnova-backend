/**
 * -----------------------------------------------------------------------------
 * File: cookie.provider.js
 * Description:
 * Enterprise Cookie Provider
 *
 * Responsibilities:
 * - Build secure cookie options
 * - Set authentication cookies
 * - Clear authentication cookies
 *
 * NOTE:
 * - No JWT generation
 * - No Business Logic
 * - No Database Logic
 * -----------------------------------------------------------------------------
 */

import env from '../../../config/env.js';

class CookieProvider {
  /**
   * --------------------------------------------------------------------------
   * Base Cookie Configuration
   * --------------------------------------------------------------------------
   */
  static getCookieOptions(maxAge) {
    return {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge,
    };
  }

  /**
   * --------------------------------------------------------------------------
   * Set Refresh Token Cookie
   * --------------------------------------------------------------------------
   */
  static setRefreshToken(res, refreshToken) {
    res.cookie(
      'refreshToken',
      refreshToken,
      this.getCookieOptions(
        7 * 24 * 60 * 60 * 1000 // 7 Days
      )
    );
  }

  /**
   * --------------------------------------------------------------------------
   * Optional Access Token Cookie
   *
   * Most APIs return access token in JSON.
   * This method is available if cookie-based auth is required.
   * --------------------------------------------------------------------------
   */
  static setAccessToken(res, accessToken) {
    res.cookie(
      'accessToken',
      accessToken,
      this.getCookieOptions(
        15 * 60 * 1000 // 15 Minutes
      )
    );
  }

  /**
   * --------------------------------------------------------------------------
   * Clear Refresh Token Cookie
   * --------------------------------------------------------------------------
   */
  static clearRefreshToken(res) {
    res.clearCookie('refreshToken', this.getCookieOptions(0));
  }

  /**
   * --------------------------------------------------------------------------
   * Clear Access Token Cookie
   * --------------------------------------------------------------------------
   */
  static clearAccessToken(res) {
    res.clearCookie('accessToken', this.getCookieOptions(0));
  }

  /**
   * --------------------------------------------------------------------------
   * Clear All Authentication Cookies
   * --------------------------------------------------------------------------
   */
  static clearAuthCookies(res) {
    this.clearAccessToken(res);
    this.clearRefreshToken(res);
  }
}

export default CookieProvider;
