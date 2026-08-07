/**
 * -----------------------------------------------------------------------------
 * File: get-current-user.service.js
 * Description:
 * Enterprise Get Current User Service
 *
 * Responsibilities:
 * - Load authenticated user
 * - Load active roles
 * - Return sanitized profile
 *
 * NOTE:
 * - No Express
 * - No JWT verification
 * - No HTTP response
 * - Pure Business Logic
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import userRepository from '../repositories/user.repository.js';
import UserMapper from '../mappers/user.mapper.js';

class GetCurrentUserService {
  /**
   * -------------------------------------------------------------------------
   * Execute
   * -------------------------------------------------------------------------
   */
  async execute(userId) {
    /**
     * -------------------------------------------------------------
     * Load Active User
     * -------------------------------------------------------------
     */

    const user = await userRepository.findActiveUserById(userId);

    if (!user) {
      throw new AppError({
        message: ErrorMessages.USER_NOT_FOUND,

        code: ErrorCodes.USER_NOT_FOUND,

        statusCode: 404,
      });
    }

    /**
     * -------------------------------------------------------------
     * Load Active Roles
     * -------------------------------------------------------------
     */

    const roles = await userRepository.findActiveUserRoles(user.id);

    /**
     * -------------------------------------------------------------
     * Return Safe Profile via UserMapper
     * -------------------------------------------------------------
     */

    return UserMapper.toProfileResponse(user, roles);
  }
}

export default new GetCurrentUserService();
