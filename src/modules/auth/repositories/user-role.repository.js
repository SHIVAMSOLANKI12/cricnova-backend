/**
 * -----------------------------------------------------------------------------
 * File: user-role.repository.js
 * Description:
 * Enterprise User Role Repository
 *
 * Responsibilities:
 * - UserRole database operations
 * - Assign / Revoke Roles
 * - Transaction aware
 * - Repository Pattern
 *
 * NOTE:
 * No Business Logic
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class UserRoleRepository extends BaseRepository {
  constructor() {
    super('userRole');
  }

  /**
   * -------------------------------------------------------------------------
   * Find User Role
   * -------------------------------------------------------------------------
   */
  async findUserRole(userId, roleId, tx = null) {
    return this.findOne(
      {
        userId,

        roleId,

        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Roles By User
   * -------------------------------------------------------------------------
   */
  async findRolesByUser(userId, tx = null) {
    return this.findMany(
      {
        where: {
          userId,

          isActive: true,
        },

        include: {
          role: true,
        },

        orderBy: {
          createdAt: 'asc',
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Assign Role
   * -------------------------------------------------------------------------
   */
  async assignRole(userId, roleId, tx = null) {
    const existing = await this.findUserRole(userId, roleId, tx);

    if (existing) {
      return existing;
    }

    return this.create(
      {
        userId,

        roleId,

        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke Role
   * -------------------------------------------------------------------------
   */
  async revokeRole(userId, roleId, tx = null) {
    return this.updateMany(
      {
        userId,

        roleId,

        isActive: true,
      },
      {
        isActive: false,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Revoke All Roles
   * -------------------------------------------------------------------------
   */
  async revokeAllRoles(userId, tx = null) {
    return this.updateMany(
      {
        userId,

        isActive: true,
      },
      {
        isActive: false,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check User Has Role
   * -------------------------------------------------------------------------
   */
  async hasRole(userId, roleName, tx = null) {
    return this.exists(
      {
        userId,

        isActive: true,

        role: {
          name: roleName,

          isActive: true,
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Count Active Roles
   * -------------------------------------------------------------------------
   */
  async countRoles(userId, tx = null) {
    return this.count(
      {
        userId,

        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Remove Duplicate Assignments
   *
   * Cleanup Support
   * -------------------------------------------------------------------------
   */
  async deleteInactiveAssignments(tx = null) {
    return this.deleteMany(
      {
        isActive: false,
      },
      tx
    );
  }
}

export default new UserRoleRepository();
