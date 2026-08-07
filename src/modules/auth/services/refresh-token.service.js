/**
 * -----------------------------------------------------------------------------
 * File: refresh-token.service.js
 * Description:
 * Enterprise Refresh Token Service
 *
 * Responsibilities:
 * - Validate Refresh Token
 * - Detect Token Reuse
 * - Rotate Refresh Token
 * - Issue New Access Token
 * - Issue New Refresh Token
 * - Persist New Refresh Token
 *
 * NOTE:
 * - No Express
 * - No Cookie Handling
 * - Pure Business Logic
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import TokenProvider from '../providers/token.provider.js';

import { AUTH_CONFIG } from '../constants/auth.constants.js';

import refreshTokenRepository from '../repositories/refresh-token.repository.js';
import sessionRepository from '../repositories/session.repository.js';
import userRepository from '../repositories/user.repository.js';

class RefreshTokenService {
  /**
   * -------------------------------------------------------------------------
   * Find Active Refresh Token
   * -------------------------------------------------------------------------
   */
  async findActiveRefreshToken(refreshToken, tx = null) {
    const tokenHash = TokenProvider.hashRefreshToken(refreshToken);

    const token = await refreshTokenRepository.findActiveByHash(tokenHash, tx);

    if (!token) {
      throw new AppError({
        message: ErrorMessages.INVALID_REFRESH_TOKEN,

        code: ErrorCodes.INVALID_REFRESH_TOKEN,

        statusCode: 401,
      });
    }

    return token;
  }

  /**
   * -------------------------------------------------------------------------
   * Validate Active Session
   * -------------------------------------------------------------------------
   */
  async validateSession(refreshTokenRecord, tx = null) {
    const session = await sessionRepository.findActiveById(refreshTokenRecord.sessionId, tx);

    if (!session) {
      throw new AppError({
        message: ErrorMessages.SESSION_EXPIRED ?? 'Session has expired.',

        code: ErrorCodes.SESSION_EXPIRED ?? 'SESSION_EXPIRED',

        statusCode: 401,
      });
    }

    return session;
  }

  /**
   * -------------------------------------------------------------------------
   * Detect Refresh Token Reuse
   * -------------------------------------------------------------------------
   */
  async detectTokenReuse(refreshToken, tx = null) {
    const tokenHash = TokenProvider.hashRefreshToken(refreshToken);

    const reusedToken = await refreshTokenRepository.detectReuse(tokenHash, tx);

    if (!reusedToken) {
      return;
    }

    /**
     * -------------------------------------------------------------
     * Revoke All Active User Sessions
     * -------------------------------------------------------------
     */
    await sessionRepository.revokeAllUserSessions(reusedToken.userId, tx);

    /**
     * -------------------------------------------------------------
     * Revoke All Active Refresh Tokens
     * -------------------------------------------------------------
     */
    await refreshTokenRepository.revokeAllUserTokens(reusedToken.userId, tx);

    throw new AppError({
      message: ErrorMessages.REFRESH_TOKEN_REUSED ?? 'Refresh token reuse detected.',

      code: ErrorCodes.REFRESH_TOKEN_REUSED ?? 'REFRESH_TOKEN_REUSED',

      statusCode: 401,
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Rotate Refresh Token
   * -------------------------------------------------------------------------
   */
  async rotateRefreshToken(refreshTokenRecord, session, tx) {
    /**
     * -------------------------------------------------------------
     * Load User Roles
     * -------------------------------------------------------------
     */
    const roles = await userRepository.findActiveUserRoles(refreshTokenRecord.userId, tx);

    /**
     * -------------------------------------------------------------
     * Build JWT Payload
     * -------------------------------------------------------------
     */
    const jwtPayload = {
      sub: refreshTokenRecord.userId,

      sessionId: session.id,

      roles,
    };

    /**
     * -------------------------------------------------------------
     * Generate New Token Pair
     * -------------------------------------------------------------
     */
    const tokenPair = TokenProvider.generateTokenPair(jwtPayload);

    /**
     * -------------------------------------------------------------
     * Persist New Refresh Token
     * -------------------------------------------------------------
     */
    const newRefreshToken = await refreshTokenRepository.create(
      {
        userId: refreshTokenRecord.userId,

        sessionId: session.id,

        tokenHash: tokenPair.refreshTokenHash,

        expiresAt: new Date(
          Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ),
      },
      tx
    );

    /**
     * -------------------------------------------------------------
     * Link Rotation Chain
     * -------------------------------------------------------------
     */
    await refreshTokenRepository.rotateToken(refreshTokenRecord.id, newRefreshToken.id, tx);

    /**
     * -------------------------------------------------------------
     * Revoke Previous Refresh Token
     * -------------------------------------------------------------
     */
    await refreshTokenRepository.revokeToken(refreshTokenRecord.id, tx);

    return {
      accessToken: tokenPair.accessToken,

      refreshToken: tokenPair.refreshToken,

      roles,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * Execute Refresh Token Rotation
   * -------------------------------------------------------------------------
   */
  async execute(refreshToken) {
    return prisma.$transaction(async (tx) => {
      /**
       * -------------------------------------------------------------
       * Detect Token Reuse
       * -------------------------------------------------------------
       */
      await this.detectTokenReuse(refreshToken, tx);

      /**
       * -------------------------------------------------------------
       * Find Active Refresh Token
       * -------------------------------------------------------------
       */
      const refreshTokenRecord = await this.findActiveRefreshToken(refreshToken, tx);

      /**
       * -------------------------------------------------------------
       * Validate Session
       * -------------------------------------------------------------
       */
      const session = await this.validateSession(refreshTokenRecord, tx);

      /**
       * -------------------------------------------------------------
       * Rotate Refresh Token
       * -------------------------------------------------------------
       */
      const tokenPair = await this.rotateRefreshToken(refreshTokenRecord, session, tx);

      /**
       * -------------------------------------------------------------
       * Update Session Activity
       * -------------------------------------------------------------
       */
      await sessionRepository.updateLastActivity(session.id, tx);

      /**
       * -------------------------------------------------------------
       * Return New Tokens
       * -------------------------------------------------------------
       */
      return tokenPair;
    });
  }
}

export default new RefreshTokenService();
