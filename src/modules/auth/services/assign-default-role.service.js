/**
 * -----------------------------------------------------------------------------
 * File: assign-default-role.service.js
 * Description:
 * Enterprise Default Role Assignment Service
 *
 * Responsibilities:
 * - Assign default PLAYER role
 * - Prevent duplicate assignments
 * - Transaction aware
 * - Repository pattern only
 *
 * NOTE:
 * - No Express
 * - No Prisma
 * - No HTTP Response
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import { ROLE } from '../constants/auth.constants.js';

import roleRepository from '../repositories/role.repository.js';
import userRoleRepository from '../repositories/user-role.repository.js';

class AssignDefaultRoleService {
  /**
   * -------------------------------------------------------------------------
   * Assign PLAYER Role
   * -------------------------------------------------------------------------
   */
  async execute(userId, tx) {
    /**
     * -------------------------------------------------------------
     * Find PLAYER Role
     * -------------------------------------------------------------
     */

    const role = await roleRepository.findByName(ROLE.PLAYER, tx);

    if (!role) {
      throw new AppError({
        message: ErrorMessages.ROLE_NOT_FOUND,
        code: ErrorCodes.ROLE_NOT_FOUND,
        statusCode: 500,
      });
    }

    /**
     * -------------------------------------------------------------
     * Prevent Duplicate Assignment
     * -------------------------------------------------------------
     */

    const alreadyAssigned = await userRoleRepository.findUserRole(userId, role.id, tx);

    if (alreadyAssigned) {
      return role;
    }

    /**
     * -------------------------------------------------------------
     * Assign PLAYER Role
     * -------------------------------------------------------------
     */

    await userRoleRepository.assignRole(userId, role.id, tx);

    return role;
  }
}

export default new AssignDefaultRoleService();
