/**
 * -----------------------------------------------------------------------------
 * File: session.provider.js
 * Description:
 * Enterprise Session Provider
 *
 * Responsibilities:
 * - Generate Session Metadata
 * - Extract Device Information
 * - Normalize IP Address
 * - Normalize User Agent
 * - Build Session Payload
 *
 * NOTE:
 * No Database Logic.
 * No Prisma.
 * No Express Response.
 * -----------------------------------------------------------------------------
 */

import { AUTH_CONFIG, LOGIN_METHOD } from '../constants/auth.constants.js';

class SessionProvider {
  /**
   * Normalize IP Address
   */
  static getClientIp(req) {
    if (!req) {
      return null;
    }
    return (
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      null
    );
  }

  /**
   * Normalize User Agent
   */
  static getUserAgent(req) {
    if (!req) {
      return 'Unknown';
    }
    return (
      req.headers?.['user-agent'] ||
      (typeof req.get === 'function' ? req.get('User-Agent') : 'Unknown')
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Build Session Object
   * -------------------------------------------------------------------------
   */
  static build(req, { loginMethod = LOGIN_METHOD.PHONE_OTP } = {}) {
    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + AUTH_CONFIG.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    return {
      ipAddress: this.getClientIp(req),

      userAgent: this.getUserAgent(req),

      loginMethod,

      lastActivityAt: now,

      expiresAt,
    };
  }
}

export default SessionProvider;
