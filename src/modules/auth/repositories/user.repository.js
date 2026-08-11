/**
 * -----------------------------------------------------------------------------
 * File: user.repository.js
 * Description:
 * User Repository
 *
 * Responsibilities:
 * - User specific database operations.
 * - No business logic.
 * - Extends BaseRepository.
 *
 * NOTE:
 * Business validations should be implemented inside Services.
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  /**
   * Create user with phone field mapping.
   */
  async create(data, tx = null, options = {}) {
    const payload = { ...data };
    if (payload.mobile && !payload.phone) {
      payload.phone = payload.mobile;
      delete payload.mobile;
    }
    return super.create(payload, tx, options);
  }

  /**
   * -------------------------------------------------------------------------
   * Find User By Mobile
   * -------------------------------------------------------------------------
   */
  async findByMobile(mobile, tx = null) {
    if (typeof mobile !== 'string' || mobile.trim().length === 0) {
      return null;
    }

    const normalizedMobile = mobile.trim();

    const client = tx ? tx.user : this.model;

    return client.findUnique({
      where: {
        phone: normalizedMobile,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Find User By Email
   * -------------------------------------------------------------------------
   */
  async findByEmail(email, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active User
   * -------------------------------------------------------------------------
   */
  async findActiveUserById(id, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.findFirst({
      where: {
        id,

        deletedAt: null,
      },
    });
  }

  /**
   * Update last login timestamp.
   */
  async updateLastLogin(id, date = new Date(), tx = null) {
    return this.update({ id }, { lastLoginAt: date }, tx);
  }

  /**
   * -------------------------------------------------------------------------
   * Fetch Active User Roles
   * -------------------------------------------------------------------------
   */
  async findActiveUserRoles(userId, tx = null) {
    const client = tx ? tx.userRole : null;

    let userRoles;

    if (client) {
      userRoles = await client.findMany({
        where: {
          userId,

          isActive: true,
        },

        include: {
          role: true,
        },
      });
    } else {
      const user = await this.model.findUnique({
        where: {
          id: userId,
        },

        include: {
          userRoles: {
            where: {
              isActive: true,
            },

            include: {
              role: true,
            },
          },
        },
      });

      userRoles = user?.userRoles ?? [];
    }

    if (!userRoles.length) {
      return [];
    }

    return userRoles.map(({ role }) => role.name);
  }
  /**
   * -------------------------------------------------------------------------
   * Check Mobile Exists
   * -------------------------------------------------------------------------
   */
  async mobileExists(mobile, tx = null) {
    return this.exists(
      {
        phone: mobile,

        deletedAt: null,
      },

      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check Email Exists
   * -------------------------------------------------------------------------
   */
  async emailExists(email, tx = null) {
    return this.exists(
      {
        email,

        deletedAt: null,
      },

      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check Username Exists
   * -------------------------------------------------------------------------
   */
  async existsByUsername(username, tx = null) {
    return this.exists(
      {
        username,
      },

      tx
    );
  }
}

export default new UserRepository();
