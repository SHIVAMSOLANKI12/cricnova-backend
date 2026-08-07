/**
 * -----------------------------------------------------------------------------
 * File: token.provider.js
 * Description:
 * Enterprise Token Provider
 *
 * Responsibilities:
 * - Generate Access Token
 * - Generate Refresh Token
 * - Generate Token Pair
 * - Verify Tokens
 * - Decode Tokens
 * - Hash Refresh Tokens
 *
 * NOTE:
 * No Database Logic
 * No Express
 * No Cookies
 * -----------------------------------------------------------------------------
 */

import crypto from 'crypto';

import JWTProvider from './jwt.provider.js';

class TokenProvider {
  /**
   * --------------------------------------------------------------------------
   * Generate Secure Refresh Token
   * --------------------------------------------------------------------------
   */
  static generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * --------------------------------------------------------------------------
   * Hash Refresh Token
   * --------------------------------------------------------------------------
   */
  static hashRefreshToken(refreshToken) {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
  }

  /**
   * --------------------------------------------------------------------------
   * Generate Access Token
   * --------------------------------------------------------------------------
   */
  static generateAccessToken(payload) {
    return JWTProvider.generateAccessToken(payload);
  }

  /**
   * --------------------------------------------------------------------------
   * Verify Access Token
   * --------------------------------------------------------------------------
   */
  static verifyAccessToken(token) {
    return JWTProvider.verifyAccessToken(token);
  }

  /**
   * --------------------------------------------------------------------------
   * Generate Complete Token Pair
   * --------------------------------------------------------------------------
   */
  static generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);

    const refreshToken = this.generateRefreshToken();

    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
    };
  }

  /**
   * --------------------------------------------------------------------------
   * Verify Refresh Token Hash
   * --------------------------------------------------------------------------
   */
  static verifyRefreshToken(plainToken, storedHash) {
    const incomingHash = this.hashRefreshToken(plainToken);

    return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(storedHash));
  }

  /**
   * --------------------------------------------------------------------------
   * Decode Access Token
   * --------------------------------------------------------------------------
   */
  static decodeAccessToken(token) {
    return JWTProvider.decode(token);
  }
}

export default TokenProvider;
