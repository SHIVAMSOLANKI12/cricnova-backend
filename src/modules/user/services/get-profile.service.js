/**
 * -----------------------------------------------------------------------------
 * File: get-profile.service.js
 * Description:
 * Enterprise Get User Profile Service
 *
 * Responsibilities:
 * - Fetch authenticated user's profile
 * - Verify account availability
 * - Return sanitized profile DTO
 *
 * NOTE:
 * - No Express
 * - No Prisma
 * - No HTTP response
 * - No business logic related to profile mutation
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import userProfileRepository from '../repositories/user-profile.repository.js';
import UserProfileMapper from '../mappers/user-profile.mapper.js';

class GetProfileService {
  /**
   * ---------------------------------------------------------------------------
   * Execute
   * ---------------------------------------------------------------------------
   *
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async execute(userId) {
    /**
     * -------------------------------------------------------------------------
     * Step 1: Validate Authentication Context
     * -------------------------------------------------------------------------
     */
    if (!userId) {
      throw new AppError({
        message: ErrorMessages.UNAUTHORIZED ?? 'Authentication required.',

        code: ErrorCodes.UNAUTHORIZED ?? 'UNAUTHORIZED',

        statusCode: 401,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Step 2: Load User Profile
     * -------------------------------------------------------------------------
     */
    const user = await userProfileRepository.findProfileByUserId(userId);

    /**
     * -------------------------------------------------------------------------
     * Step 3: User Not Found
     * -------------------------------------------------------------------------
     */
    if (!user) {
      throw new AppError({
        message: ErrorMessages.USER_NOT_FOUND ?? 'User not found.',

        code: ErrorCodes.USER_NOT_FOUND ?? 'USER_NOT_FOUND',

        statusCode: 404,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Step 4: Account Status Guard
     * -------------------------------------------------------------------------
     */
    if (user.status !== 'ACTIVE') {
      throw new AppError({
        message: ErrorMessages.USER_INACTIVE ?? 'Your account is inactive or suspended.',

        code: ErrorCodes.USER_INACTIVE ?? 'USER_INACTIVE',

        statusCode: 403,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Step 5: Return Sanitized Profile DTO
     * -------------------------------------------------------------------------
     */
    return UserProfileMapper.toProfileResponse(user);
  }
}

export default new GetProfileService();
