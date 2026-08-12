/**
 * -----------------------------------------------------------------------------
 * File: player-profile.service.js
 * Description:
 * Enterprise Cricket Player Profile Service
 *
 * Responsibilities:
 * - Fetch authenticated user's player profile
 * - Create player profile when it does not exist
 * - Update existing player profile
 * - Enforce authenticated user ownership
 * - Build safe persistence payload
 * - Return sanitized PlayerProfile DTO
 *
 * Notes:
 * - Input shape validation is handled by Zod validation middleware.
 * - Database operations are delegated to PlayerProfileRepository.
 * - API response transformation is delegated to PlayerProfileMapper.
 * - No cricket statistics or career calculations belong here.
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import playerProfileRepository from '../repositories/player-profile.repository.js';
import PlayerProfileMapper from '../mappers/player-profile.mapper.js';

/**
 * Fields that are allowed to be persisted through the PlayerProfile API.
 *
 * Server-controlled fields such as:
 * - id
 * - userId
 * - createdAt
 * - updatedAt
 *
 * are intentionally excluded from the client update payload.
 */
const PLAYER_PROFILE_FIELDS = Object.freeze([
  'displayName',
  'playingRole',
  'battingStyle',
  'bowlingStyle',
  'bio',
]);

class PlayerProfileService {
  /**
   * ---------------------------------------------------------------------------
   * Validate authenticated user
   * ---------------------------------------------------------------------------
   */
  validateUserId(userId) {
    if (!userId) {
      throw new AppError({
        message: ErrorMessages.UNAUTHORIZED ?? 'Authentication required.',
        code: ErrorCodes.UNAUTHORIZED ?? 'UNAUTHORIZED',
        statusCode: 401,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Build safe PlayerProfile persistence payload
   * ---------------------------------------------------------------------------
   *
   * Only explicitly supported PlayerProfile fields are allowed to reach
   * the repository/database layer.
   */
  buildUpdatePayload(data) {
    const updateData = {};

    for (const field of PLAYER_PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updateData[field] = data[field];
      }
    }

    return updateData;
  }

  /**
   * ---------------------------------------------------------------------------
   * Get authenticated user's PlayerProfile
   * ---------------------------------------------------------------------------
   *
   * Returns 404 when the authenticated user has not created a PlayerProfile.
   */
  async getMyPlayerProfile(userId) {
    this.validateUserId(userId);

    const playerProfile = await playerProfileRepository.findByUserId(userId);

    if (!playerProfile) {
      throw new AppError({
        message: ErrorMessages.RESOURCE_NOT_FOUND ?? 'Player profile not found.',
        code: ErrorCodes.RESOURCE_NOT_FOUND ?? 'RESOURCE_NOT_FOUND',
        statusCode: 404,
      });
    }

    return PlayerProfileMapper.toProfileResponse(playerProfile);
  }

  /**
   * ---------------------------------------------------------------------------
   * Create or Update authenticated user's PlayerProfile
   * ---------------------------------------------------------------------------
   *
   * PATCH semantics:
   *
   * Profile exists
   *      -> UPDATE
   *
   * Profile does not exist
   *      -> CREATE
   */
  async updateMyPlayerProfile(userId, data) {
    this.validateUserId(userId);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new AppError({
        message: 'Player profile data is required.',
        code: 'PLAYER_PROFILE_DATA_REQUIRED',
        statusCode: 400,
      });
    }

    const updateData = this.buildUpdatePayload(data);

    if (Object.keys(updateData).length === 0) {
      throw new AppError({
        message: 'At least one player profile field is required.',
        code: 'PLAYER_PROFILE_DATA_REQUIRED',
        statusCode: 400,
      });
    }

    const existingProfile = await playerProfileRepository.findByUserId(userId);

    let playerProfile;

    if (existingProfile) {
      /**
       * Existing profile → partial update.
       */
      playerProfile = await playerProfileRepository.updateByUserId(userId, updateData);
    } else {
      /**
       * No profile → create first PlayerProfile for this user.
       *
       * userId is always taken from the authenticated request and
       * never from the client payload.
       */
      playerProfile = await playerProfileRepository.createProfile({
        userId,
        ...updateData,
      });
    }

    return PlayerProfileMapper.toProfileResponse(playerProfile);
  }
}

export default new PlayerProfileService();
