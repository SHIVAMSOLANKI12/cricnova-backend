/**
 * -----------------------------------------------------------------------------
 * File: logout-all.service.js
 * Description:
 * Enterprise Logout All Service
 *
 * Responsibilities:
 * - Logout from all active devices
 * - Revoke all sessions
 * - Revoke all refresh tokens
 * - Execute atomically
 *
 * NOTE:
 * - No Express
 * - No Cookies
 * - Pure Business Logic
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import sessionRepository from '../repositories/session.repository.js';
import refreshTokenRepository from '../repositories/refresh-token.repository.js';

class LogoutAllService {
  /**
   * -------------------------------------------------------------------------
   * Execute Logout All Devices
   * -------------------------------------------------------------------------
   */
  async execute({ userId, _exceptSessionId = null }) {
    return prisma.$transaction(async (tx) => {
      /**
       * -------------------------------------------------------------
       * Revoke All Sessions
       * -------------------------------------------------------------
       */

      await sessionRepository.revokeAllUserSessions(userId, tx);

      /**
       * -------------------------------------------------------------
       * Revoke All Refresh Tokens
       * -------------------------------------------------------------
       */

      await refreshTokenRepository.revokeAllUserTokens(userId, tx);

      /**
       * -------------------------------------------------------------
       * Success
       * -------------------------------------------------------------
       */

      return {
        success: true,

        message: 'Logged out from all devices successfully.',
      };
    });
  }
}

export default new LogoutAllService();
