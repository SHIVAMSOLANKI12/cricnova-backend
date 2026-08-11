/**
 * -----------------------------------------------------------------------------
 * File: update-photo.service.js
 * Description:
 * Enterprise User Profile Photo Update Service
 *
 * Responsibilities:
 * - Update authenticated user's profile photo
 * - Validate active user
 * - Validate uploaded photo
 * - Upload new photo to storage
 * - Persist photo URL + storage public ID atomically
 * - Recalculate profile completion
 * - Remove previous photo after successful DB persistence
 * - Compensate new upload when database persistence fails
 * - Return sanitized profile DTO
 *
 * IMPORTANT:
 * Cloudinary and PostgreSQL are separate systems.
 *
 * Therefore:
 *
 * 1. Upload new asset
 * 2. Persist database state in transaction
 * 3. Delete old asset
 *
 * We NEVER delete the old asset before the database update succeeds.
 *
 * NOTE:
 * - No Express logic
 * - No HTTP response handling
 * - No direct Prisma model operations
 * - profileCompleted is always server controlled
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';
import logger from '../../../common/logger/winston.js';

import { STORAGE_ASSET_TYPE } from '../../../storage/storage.constants.js';

import cloudinaryStorageProvider from '../../../storage/providers/cloudinary-storage.provider.js';

import userProfileRepository from '../repositories/user-profile.repository.js';
import UserProfileMapper from '../mappers/user-profile.mapper.js';

import { validateProfilePhoto } from '../validations/photo.validation.js';

class UpdatePhotoService {
  /**
   * ---------------------------------------------------------------------------
   * Profile Completion Rule
   * ---------------------------------------------------------------------------
   *
   * Profile is complete when:
   *
   * firstName
   * +
   * city
   * +
   * gender
   * +
   * dateOfBirth
   * +
   * (profileImageUrl OR avatarId)
   *
   * profileCompleted is NEVER accepted from the client.
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
   * Execute Photo Update
   * ---------------------------------------------------------------------------
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {Object} params.file
   *
   * @returns {Promise<Object>}
   */
  async execute({ userId, file }) {
    /**
     * -------------------------------------------------------------------------
     * Step 1: Authentication Guard
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
     * Step 2: Validate Uploaded Photo
     * -------------------------------------------------------------------------
     *
     * This creates a normalized photo contract and prevents the raw Multer
     * object from travelling deeper into the application.
     */
    const photo = validateProfilePhoto(file);

    let uploadedAsset = null;

    try {
      /**
       * -----------------------------------------------------------------------
       * Step 3: Load Current User
       * -----------------------------------------------------------------------
       *
       * We intentionally load the current record before uploading so that:
       * - account status is checked
       * - old public ID is captured
       */
      const currentUser = await userProfileRepository.findProfileByUserId(userId);

      if (!currentUser) {
        throw new AppError({
          message: ErrorMessages.USER_NOT_FOUND ?? 'User not found.',

          code: ErrorCodes.USER_NOT_FOUND ?? 'USER_NOT_FOUND',

          statusCode: 404,
        });
      }

      /**
       * -----------------------------------------------------------------------
       * Step 4: Account Status Verification
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
       * Step 5: Capture Previous Storage Asset
       * -----------------------------------------------------------------------
       */
      const previousPublicId = currentUser.profileImagePublicId ?? null;

      /**
       * -----------------------------------------------------------------------
       * Step 6: Upload New Photo
       * -----------------------------------------------------------------------
       *
       * IMPORTANT:
       * New asset is uploaded BEFORE DB modification.
       *
       * If DB fails later, this asset is deleted in the compensation block.
       */
      uploadedAsset = await cloudinaryStorageProvider.upload({
        buffer: photo.buffer,

        mimeType: photo.mimeType,

        userId,

        assetType: STORAGE_ASSET_TYPE.PROFILE_PHOTO,
      });

      /**
       * -----------------------------------------------------------------------
       * Step 7: Persist Database State Atomically
       * -----------------------------------------------------------------------
       */
      const updatedUser = await prisma.$transaction(async (tx) => {
        /**
         * -----------------------------------------------------------------
         * Re-read user inside transaction
         * -----------------------------------------------------------------
         *
         * This prevents using stale profile state if another request
         * modified the profile between the first read and this transaction.
         */
        const latestUser = await userProfileRepository.findProfileByUserId(userId, tx);

        if (!latestUser) {
          throw new AppError({
            message: ErrorMessages.USER_NOT_FOUND ?? 'User not found.',

            code: ErrorCodes.USER_NOT_FOUND ?? 'USER_NOT_FOUND',

            statusCode: 404,
          });
        }

        if (latestUser.status !== 'ACTIVE') {
          throw new AppError({
            message: ErrorMessages.USER_INACTIVE ?? 'Your account is inactive or suspended.',

            code: ErrorCodes.USER_INACTIVE ?? 'USER_INACTIVE',

            statusCode: 403,
          });
        }

        /**
         * ---------------------------------------------------------------
         * Build Future Profile State
         * ---------------------------------------------------------------
         */
        const futureUser = {
          ...latestUser,

          profileImageUrl: uploadedAsset.url,

          profileImagePublicId: uploadedAsset.publicId,
        };

        /**
         * ---------------------------------------------------------------
         * Server-Controlled Completion
         * ---------------------------------------------------------------
         */
        const profileCompleted = this.isProfileCompleted(futureUser);

        /**
         * ---------------------------------------------------------------
         * Persist Profile
         * ---------------------------------------------------------------
         */
        return userProfileRepository.updateProfile(
          userId,
          {
            profileImageUrl: uploadedAsset.url,

            profileImagePublicId: uploadedAsset.publicId,

            profileCompleted,
          },
          tx
        );
      });

      /**
       * -----------------------------------------------------------------------
       * Step 8: Remove Previous Asset
       * -----------------------------------------------------------------------
       *
       * Database is already successfully committed.
       *
       * Therefore the old asset is no longer referenced by the user's profile.
       */
      if (previousPublicId && previousPublicId !== uploadedAsset.publicId) {
        try {
          await cloudinaryStorageProvider.delete({
            key: previousPublicId,
          });
        } catch (cleanupError) {
          /**
           * -------------------------------------------------------------------
           * IMPORTANT:
           * Do NOT rollback the successful database transaction.
           *
           * The database is authoritative for the current profile.
           *
           * Old Cloudinary asset cleanup can be retried asynchronously later.
           * -------------------------------------------------------------------
           */
          logger.error('Profile photo cleanup failed after successful database update.', {
            userId,
            previousPublicId,
            error: cleanupError?.message ?? cleanupError,
            stack: cleanupError?.stack,
          });
        }
      }

      /**
       * -----------------------------------------------------------------------
       * Step 9: Return Sanitized DTO
       * -----------------------------------------------------------------------
       */
      return UserProfileMapper.toProfileResponse(updatedUser);
    } catch (error) {
      /**
       * -----------------------------------------------------------------------
       * Step 10: Compensation
       * -----------------------------------------------------------------------
       *
       * If the database update failed AFTER Cloudinary upload succeeded,
       * delete the newly uploaded asset.
       *
       * This prevents orphaned assets.
       */
      if (uploadedAsset?.publicId) {
        try {
          await cloudinaryStorageProvider.delete({
            key: uploadedAsset.publicId,
          });
        } catch (cleanupError) {
          /**
           * -------------------------------------------------------------------
           * Cleanup failure must not hide the original application error.
           *
           * Production systems should additionally send this to centralized
           * logging/monitoring for retry/cleanup.
           * -------------------------------------------------------------------
           */
          logger.error('Failed to compensate newly uploaded profile photo.', {
            userId,
            publicId: uploadedAsset.publicId,
            error: cleanupError?.message ?? cleanupError,
            stack: cleanupError?.stack,
          });
        }
      }

      throw error;
    }
  }
}

export default new UpdatePhotoService();
