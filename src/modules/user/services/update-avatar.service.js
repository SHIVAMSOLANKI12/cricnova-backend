/**
 * -----------------------------------------------------------------------------
 * File: update-avatar.service.js
 * Description:
 * Enterprise User Avatar Update Service
 *
 * Responsibilities:
 * - Update authenticated user's avatar
 * - Validate avatar availability
 * - Verify user account status
 * - Recalculate profile completion
 * - Persist avatar and completion atomically
 * - Return sanitized user profile DTO
 *
 * NOTE:
 * - No Express
 * - No HTTP response
 * - No direct Prisma model operations
 * - Avatar catalog is the source of truth for static avatars
 * - profileCompleted is always server controlled
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import userProfileRepository from '../repositories/user-profile.repository.js';
import UserProfileMapper from '../mappers/user-profile.mapper.js';

import { isActiveAvatar } from '../constants/avatar.constants.js';

class UpdateAvatarService {
  /**
   * ---------------------------------------------------------------------------
   * Validate Input
   * ---------------------------------------------------------------------------
   *
   * Detailed request validation is handled by Zod.
   * This service-level guard protects internal callers as well.
   */
  validateInput({ userId, avatarId }) {
    if (!userId) {
      throw new AppError({
        message: ErrorMessages.UNAUTHORIZED ?? 'Authentication required.',

        code: ErrorCodes.UNAUTHORIZED ?? 'UNAUTHORIZED',

        statusCode: 401,
      });
    }

    if (typeof avatarId !== 'string' || avatarId.trim().length === 0) {
      throw new AppError({
        message: 'Avatar ID is required.',
        code: 'AVATAR_ID_REQUIRED',
        statusCode: 400,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Calculate Profile Completion
   * ---------------------------------------------------------------------------
   *
   * Same business rule as User Profile module:
   *
   * Required:
   * - firstName
   * - city
   * - gender
   * - dateOfBirth
   *
   * Identity:
   * - profileImageUrl OR avatarId
   *
   * IMPORTANT:
   * This logic is intentionally kept aligned with
   * UpdateProfileService.
   */
  isProfileCompleted(user) {
    const hasFirstName = typeof user.firstName === 'string' && user.firstName.trim().length > 0;

    const hasCity = typeof user.city === 'string' && user.city.trim().length > 0;

    const hasGender = Boolean(user.gender);

    const hasDateOfBirth =
      Boolean(user.dateOfBirth) && !Number.isNaN(new Date(user.dateOfBirth).getTime());

    const hasProfileIdentity = Boolean(user.profileImageUrl || user.avatarId);

    return hasFirstName && hasCity && hasGender && hasDateOfBirth && hasProfileIdentity;
  }

  /**
   * ---------------------------------------------------------------------------
   * Execute Avatar Update
   * ---------------------------------------------------------------------------
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.avatarId
   * @returns {Promise<Object>}
   */
  async execute({ userId, avatarId }) {
    /**
     * -------------------------------------------------------------------------
     * Step 1: Validate Service Boundary
     * -------------------------------------------------------------------------
     */
    this.validateInput({
      userId,
      avatarId,
    });

    const normalizedAvatarId = avatarId.trim();

    /**
     * -------------------------------------------------------------------------
     * Step 2: Verify Avatar Availability
     * -------------------------------------------------------------------------
     *
     * The validation layer normally performs this check.
     *
     * This second check protects direct/internal service callers.
     */
    if (!isActiveAvatar(normalizedAvatarId)) {
      throw new AppError({
        message: 'Selected avatar is not available.',

        code: 'INVALID_AVATAR',

        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Step 3: Atomic Database Workflow
     * -------------------------------------------------------------------------
     */
    return prisma.$transaction(async (tx) => {
      /**
       * -----------------------------------------------------------------------
       * Step 3.1: Load Current Profile
       * -----------------------------------------------------------------------
       */
      const currentUser = await userProfileRepository.findProfileByUserId(userId, tx);

      if (!currentUser) {
        throw new AppError({
          message: ErrorMessages.USER_NOT_FOUND ?? 'User not found.',

          code: ErrorCodes.USER_NOT_FOUND ?? 'USER_NOT_FOUND',

          statusCode: 404,
        });
      }

      /**
       * -----------------------------------------------------------------------
       * Step 3.2: Verify Account Status
       * -----------------------------------------------------------------------
       */
      if (currentUser.status !== 'ACTIVE') {
        throw new AppError({
          message: ErrorMessages.USER_INACTIVE ?? 'Your account is inactive or suspended.',

          code: ErrorCodes.USER_INACTIVE ?? 'USER_INACTIVE',

          statusCode: 403,
        });
      }

      /**
       * -----------------------------------------------------------------------
       * Step 3.3: Build Future Profile State
       * -----------------------------------------------------------------------
       */
      const futureUser = {
        ...currentUser,

        avatarId: normalizedAvatarId,
      };

      /**
       * -----------------------------------------------------------------------
       * Step 3.4: Recalculate Profile Completion
       * -----------------------------------------------------------------------
       */
      const profileCompleted = this.isProfileCompleted(futureUser);

      /**
       * -----------------------------------------------------------------------
       * Step 3.5: Persist Avatar + Completion Atomically
       * -----------------------------------------------------------------------
       */
      const updatedUser = await userProfileRepository.updateProfile(
        userId,
        {
          avatarId: normalizedAvatarId,

          profileCompleted,
        },
        tx
      );

      /**
       * -----------------------------------------------------------------------
       * Step 3.6: Return Sanitized DTO
       * -----------------------------------------------------------------------
       */
      return UserProfileMapper.toProfileResponse(updatedUser);
    });
  }
}

export default new UpdateAvatarService();
