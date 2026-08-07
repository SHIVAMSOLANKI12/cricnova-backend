/**
 * -----------------------------------------------------------------------------
 * File: role.repository.js
 * Description:
 * Enterprise Role Repository
 *
 * Responsibilities:
 * - Role database operations
 * - Transaction aware
 * - Repository pattern
 * - No business logic
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class RoleRepository extends BaseRepository {
  constructor() {
    super('role');
  }

  /**
   * -------------------------------------------------------------------------
   * Find Role By Name
   * -------------------------------------------------------------------------
   */
  async findByName(name, tx = null) {
    return this.findOne(
      {
        name,
        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Find Active Role By Id
   * -------------------------------------------------------------------------
   */
  async findActiveById(id, tx = null) {
    return this.findOne(
      {
        id,
        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Check Role Exists
   * -------------------------------------------------------------------------
   */
  async existsByName(name, tx = null) {
    return this.exists(
      {
        name,
        isActive: true,
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Get Active Roles
   * -------------------------------------------------------------------------
   */
  async findActiveRoles(tx = null) {
    return this.findMany(
      {
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
      tx
    );
  }

  /**
   * -------------------------------------------------------------------------
   * Get Roles By IDs
   * -------------------------------------------------------------------------
   */
  async findByIds(roleIds, tx = null) {
    return this.findMany(
      {
        where: {
          id: {
            in: roleIds,
          },
          isActive: true,
        },
      },
      tx
    );
  }
}

export default new RoleRepository();
