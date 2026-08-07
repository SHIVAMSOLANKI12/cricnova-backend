/**
 * -----------------------------------------------------------------------------
 * File: jwt.provider.js
 * Description:
 * JWT Provider for CricNova Backend
 *
 * Responsibilities:
 * - Generate Access Token
 * - Generate Refresh Token
 * - Verify Access Token
 * - Verify Refresh Token
 * - Decode Token
 *
 * NOTE:
 * Never use jsonwebtoken directly in controllers/services.
 * Always use this provider.
 * -----------------------------------------------------------------------------
 */

import jwt from 'jsonwebtoken';

import authConfig from '../../../config/auth.config.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

class JwtProvider {
  /**
   * Generate Access Token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, authConfig.accessToken.secret, {
      expiresIn: authConfig.accessToken.expiresIn,
    });
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, authConfig.refreshToken.secret, {
      expiresIn: authConfig.refreshToken.expiresIn,
    });
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, authConfig.accessToken.secret);
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.INVALID_ACCESS_TOKEN,
        code: ErrorCodes.INVALID_ACCESS_TOKEN,
        statusCode: 401,
      });
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, authConfig.refreshToken.secret);
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.INVALID_REFRESH_TOKEN,
        code: ErrorCodes.INVALID_REFRESH_TOKEN,
        statusCode: 401,
      });
    }
  }

  /**
   * Decode JWT Without Verification
   *
   * Use only for debugging or non-security operations.
   */
  static decode(token) {
    return jwt.decode(token);
  }
}

export default JwtProvider;
