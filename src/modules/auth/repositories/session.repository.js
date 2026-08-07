/**
 * -----------------------------------------------------------------------------
 * File: session.repository.js
 * Description:
 * Enterprise Session Repository
 *
 * Responsibilities:
 * - Session CRUD
 * - Multi-device session management
 * - Session revocation
 * - Last activity update
 * - Transaction aware
 *
 * NOTE:
 * No business logic.
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class SessionRepository extends BaseRepository {
  constructor() {
    super('session');
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Session
   * -------------------------------------------------------------------------
   */
  async findActiveById(sessionId, tx = null) {
    return this.findOne(
      {
        id: sessionId,

        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Sessions By User
   * -------------------------------------------------------------------------
   */
  async findActiveSessionsByUser(userId, tx = null) {
    return this.findMany(
      {
        where: {
          userId,

          revokedAt: null,

          expiresAt: {
            gt: new Date(),
          },
        },

        orderBy: {
          lastActivityAt: 'desc',
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Update Last Activity
   * -------------------------------------------------------------------------
   */
  async updateLastActivity(sessionId, tx = null) {
    const client = tx ? tx.session : this.model;

    return client.update({
      where: {
        id: sessionId,
      },

      data: {
        lastActivityAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke Session
   * -------------------------------------------------------------------------
   */
  async revokeSession(sessionId, tx = null) {
    const client = tx ? tx.session : this.model;

    return client.update({
      where: {
        id: sessionId,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Logout All Devices
   * -------------------------------------------------------------------------
   */
  async revokeAllUserSessions(userId, tx = null) {
    return this.updateMany(
      {
        userId,

        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Delete Expired Sessions
   * -------------------------------------------------------------------------
   */
  async deleteExpiredSessions(tx = null) {
    return this.deleteMany(
      {
        expiresAt: {
          lt: new Date(),
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Count Active Sessions
   * -------------------------------------------------------------------------
   */
  async countActiveSessions(userId, tx = null) {
    return this.count(
      {
        userId,

        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Find Session By Refresh Token
   *
   * Future Refresh Token Rotation Support
   * -------------------------------------------------------------------------
   */
  async findByRefreshToken(refreshTokenId, tx = null) {
    return this.findOne(
      {
        refreshTokens: {
          some: {
            id: refreshTokenId,

            revokedAt: null,
          },
        },
      },
      tx,
      {
        include: {
          refreshTokens: true,
        },
      }
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Extend Session Expiry
   *
   * Sliding Session Support
   * -------------------------------------------------------------------------
   */
  async extendExpiry(sessionId, expiresAt, tx = null) {
    return this.update(
      {
        id: sessionId,
      },
      {
        expiresAt,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check Session Ownership
   * -------------------------------------------------------------------------
   */
  async belongsToUser(sessionId, userId, tx = null) {
    return this.exists(
      {
        id: sessionId,

        userId,
      },
      tx
    );
  }
}

export default new SessionRepository();
