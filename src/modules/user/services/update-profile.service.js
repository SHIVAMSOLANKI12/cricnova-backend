/**
 * -----------------------------------------------------------------------------
 * File: update-profile.service.js
 * Description:
 * Enterprise User Profile Update Service
 *
 * Responsibilities:
 * - Update authenticated user's profile
 * - Support partial onboarding updates
 * - Calculate profile completion
 * - Persist profile and completion atomically
 * - Enforce server-controlled profile completion
 * - Return sanitized profile DTO
 *
 * NOTE:
 * - No Express
 * - No HTTP response
 * - No direct Prisma model operations
 * - profileCompleted is server controlled
 * - Detailed field validation belongs to Zod validation layer
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import userProfileRepository from '../repositories/user-profile.repository.js';
import UserProfileMapper from '../mappers/user-profile.mapper.js';

/**
 * -----------------------------------------------------------------------------
 * Allowed Profile Fields
 * -----------------------------------------------------------------------------
 *
 * Only these fields can be modified through the profile update service.
 *
 * Security-sensitive fields such as:
 * - id
 * - phone
 * - email
 * - username
 * - status
 * - profileCompleted
 *
 * are intentionally excluded.
 */
const PROFILE_FIELDS = Object.freeze([
  'firstName',
  'lastName',
  'city',
  'gender',
  'profileImageUrl',
  'avatarId',
  'dateOfBirth',
  'preferredLanguage',
]);

class UpdateProfileService {
  /**
   * ---------------------------------------------------------------------------
   * Check Profile Completion
   * ---------------------------------------------------------------------------
   *
   * Current onboarding completion requirements:
   *
   * Required:
   * - firstName
   * - city
   * - gender
   * - dateOfBirth
   *
   * Profile identity:
   * - profileImageUrl OR avatarId
   *
   * Optional:
   * - lastName
   * - preferredLanguage
   *
   * IMPORTANT:
   * This is business logic and belongs in the Service Layer.
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
   * Validate Service Input
   * ---------------------------------------------------------------------------
   *
   * This is NOT a replacement for Zod.
   *
   * Zod validates HTTP request data.
   * This method protects the service boundary when the service is called
   * directly from another internal workflow.
   */
  validateInput({ userId, data }) {
    /**
     * -------------------------------------------------------------------------
     * User ID
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
     * Data must be a plain object
     * -------------------------------------------------------------------------
     */
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new AppError({
        message: 'Profile data is required.',

        code: 'PROFILE_DATA_REQUIRED',

        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Prevent Empty PATCH
     * -------------------------------------------------------------------------
     */
    if (Object.keys(data).length === 0) {
      throw new AppError({
        message: 'At least one profile field is required.',

        code: 'PROFILE_DATA_REQUIRED',

        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Reject Unknown / Protected Fields
     * -------------------------------------------------------------------------
     *
     * This provides defense-in-depth even if the service is called without
     * the HTTP validation middleware.
     */
    const unknownFields = Object.keys(data).filter((field) => !PROFILE_FIELDS.includes(field));

    if (unknownFields.length > 0) {
      throw new AppError({
        message: `Unsupported profile field: ${unknownFields[0]}.`,

        code: 'INVALID_PROFILE_FIELD',

        statusCode: 400,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Build Safe Update Payload
   * ---------------------------------------------------------------------------
   */
  /**
   * ---------------------------------------------------------------------------
   * Build Safe Update Payload
   * ---------------------------------------------------------------------------
   */
  buildUpdatePayload(data) {
    const updateData = {};

    for (const field of PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updateData[field] = data[field];
      }
    }

    return updateData;
  }

  /**
   * ---------------------------------------------------------------------------
   * Normalize Profile Data For Persistence
   * ---------------------------------------------------------------------------
   *
   * Converts API-level date representation into the type expected by Prisma.
   *
   * API:
   *   "2000-05-20"
   *
   * Database:
   *   Date object
   *
   * Already normalized Date values are preserved.
   */
  normalizeUpdatePayload(updateData) {
    const normalizedData = {
      ...updateData,
    };

    if (Object.prototype.hasOwnProperty.call(normalizedData, 'dateOfBirth')) {
      if (normalizedData.dateOfBirth !== null && !(normalizedData.dateOfBirth instanceof Date)) {
        const parsedDate = new Date(normalizedData.dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          throw new AppError({
            message: 'Invalid date of birth.',
            code: 'INVALID_DATE_OF_BIRTH',
            statusCode: 400,
          });
        }

        normalizedData.dateOfBirth = parsedDate;
      }
    }

    return normalizedData;
  }

  /**
   * ---------------------------------------------------------------------------
   * Execute Profile Update
   * ---------------------------------------------------------------------------
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {Object} params.data
   * @returns {Promise<Object>}
   */
  async execute({ userId, data }) {
    /**
     * -------------------------------------------------------------------------
     * Step 1: Validate Service Boundary
     * -------------------------------------------------------------------------
     */
    this.validateInput({
      userId,
      data,
    });

    /**
     * -------------------------------------------------------------------------
     * Step 2: Execute Atomic Profile Workflow
     * -------------------------------------------------------------------------
     */
    return prisma.$transaction(async (tx) => {
      /**
       * -----------------------------------------------------------------------
       * Step 2.1: Load Existing Profile
       * -----------------------------------------------------------------------
       *
       * PATCH requires the existing state because omitted fields must remain
       * unchanged.
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
       * Step 2.2: Verify Account Status
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
       * Step 2.3: Build & Normalize Safe Update Payload
       * -----------------------------------------------------------------------
       *
       * profileCompleted is intentionally impossible to update through this
       * payload.
       */
      const updateData = this.buildUpdatePayload(data);

      const normalizedUpdateData = this.normalizeUpdatePayload(updateData);

      /**
       * -----------------------------------------------------------------------
       * Step 2.4: Build Future Profile State
       * -----------------------------------------------------------------------
       *
       * PATCH semantics:
       *
       * Existing values are preserved when a field is not supplied.
       */
      const futureUser = {
        ...currentUser,
        ...normalizedUpdateData,
      };

      /**
       * -----------------------------------------------------------------------
       * Step 2.5: Calculate Profile Completion
       * -----------------------------------------------------------------------
       *
       * Server is authoritative.
       *
       * Client cannot decide whether the profile is complete.
       */
      const profileCompleted = this.isProfileCompleted(futureUser);

      /**
       * -----------------------------------------------------------------------
       * Step 2.6: Persist Profile + Completion Atomically
       * -----------------------------------------------------------------------
       *
       * Single database write inside the same transaction.
       */
      const updatedUser = await userProfileRepository.updateProfile(
        userId,
        {
          ...normalizedUpdateData,
          profileCompleted,
        },
        tx
      );

      /**
       * -----------------------------------------------------------------------
       * Step 2.7: Return Sanitized DTO
       * -----------------------------------------------------------------------
       */
      return UserProfileMapper.toProfileResponse(updatedUser);
    });
  }
}

export default new UpdateProfileService();
