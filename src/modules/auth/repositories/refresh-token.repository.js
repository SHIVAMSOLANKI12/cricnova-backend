/**
 * -----------------------------------------------------------------------------
 * File: refresh-token.repository.js
 * Description:
 * Enterprise Refresh Token Repository
 *
 * Responsibilities:
 * - Refresh Token CRUD
 * - Refresh Token Rotation (RTR)
 * - Token Revocation
 * - Reuse Detection
 * - Transaction Aware
 * - Repository Pattern
 *
 * NOTE:
 * No Business Logic
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super('refreshToken');
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Refresh Token By Hash
   * -------------------------------------------------------------------------
   */
  async findActiveByHash(tokenHash, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.findFirst({
      where: {
        tokenHash,

        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },

      include: {
        session: true,

        user: true,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Find Refresh Token By Id
   * -------------------------------------------------------------------------
   */
  async findById(id, tx = null) {
    return super.findById(
      id,

      tx,

      {
        include: {
          user: true,

          session: true,
        },
      }
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Tokens By User
   * -------------------------------------------------------------------------
   */
  async findActiveTokensByUser(userId, tx = null) {
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
          createdAt: 'desc',
        },
      },

      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke Token
   * -------------------------------------------------------------------------
   */
  async revokeToken(id, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.update({
      where: {
        id,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Rotate Refresh Token
   * -------------------------------------------------------------------------
   */
  async rotateToken(currentTokenId, newTokenId, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.update({
      where: {
        id: currentTokenId,
      },

      data: {
        replacedByTokenId: newTokenId,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke Session Tokens
   * -------------------------------------------------------------------------
   */
  async revokeSessionTokens(sessionId, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.updateMany({
      where: {
        sessionId,

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke All User Tokens
   * -------------------------------------------------------------------------
   */
  async revokeAllUserTokens(userId, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.updateMany({
      where: {
        userId,

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Detect Refresh Token Reuse
   * -------------------------------------------------------------------------
   */
  async detectReuse(tokenHash, tx = null) {
    const client = tx ? tx.refreshToken : this.model;

    return client.findFirst({
      where: {
        tokenHash,

        revokedAt: {
          not: null,
        },
      },

      include: {
        session: true,

        user: true,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Count Active Tokens
   * -------------------------------------------------------------------------
   */
  async countActiveTokens(userId, tx = null) {
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
   * Delete Expired Tokens
   * -------------------------------------------------------------------------
   */
  async deleteExpiredTokens(tx = null) {
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
   * Find Latest Active Token By Session
   * -------------------------------------------------------------------------
   */
  async findLatestBySession(sessionId, tx = null) {
    return this.findOne(
      {
        sessionId,

        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },

      tx,

      {
        orderBy: {
          createdAt: 'desc',
        },
      }
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check Token Ownership
   * -------------------------------------------------------------------------
   */
  async belongsToUser(tokenId, userId, tx = null) {
    return this.exists(
      {
        id: tokenId,

        userId,
      },

      tx
    );
  }
}

export default new RefreshTokenRepository();
