/**
 * -----------------------------------------------------------------------------
 * File: logout.service.js
 * Description:
 * Enterprise Logout Service
 *
 * Responsibilities:
 * - Validate Refresh Token
 * - Validate Active Session
 * - Revoke Refresh Token
 * - Revoke Session
 *
 * NOTE:
 * - No Express
 * - No Cookies
 * - Pure Business Logic
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import TokenProvider from '../providers/token.provider.js';

import refreshTokenRepository from '../repositories/refresh-token.repository.js';
import sessionRepository from '../repositories/session.repository.js';

class LogoutService {
  /**
   * -------------------------------------------------------------------------
   * Execute Logout
   * -------------------------------------------------------------------------
   */
  async execute(refreshToken) {
    return prisma.$transaction(async (tx) => {
      const tokenHash = TokenProvider.hashRefreshToken(refreshToken);

      const refreshTokenRecord = await refreshTokenRepository.findActiveByHash(tokenHash, tx);

      if (!refreshTokenRecord) {
        throw new AppError({
          message: ErrorMessages.INVALID_REFRESH_TOKEN,

          code: ErrorCodes.INVALID_REFRESH_TOKEN,

          statusCode: 401,
        });
      }

      const session = await sessionRepository.findActiveById(refreshTokenRecord.sessionId, tx);

      if (!session) {
        throw new AppError({
          message: ErrorMessages.SESSION_EXPIRED,

          code: ErrorCodes.SESSION_EXPIRED,

          statusCode: 401,
        });
      }

      await refreshTokenRepository.revokeToken(refreshTokenRecord.id, tx);

      await sessionRepository.revokeSession(session.id, tx);

      return {
        success: true,

        message: 'Logged out successfully.',
      };
    });
  }
}

export default new LogoutService();
