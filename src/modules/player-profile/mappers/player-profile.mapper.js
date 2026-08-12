/**
 * -----------------------------------------------------------------------------
 * File: player-profile.mapper.js
 * Description:
 * Enterprise Cricket Player Profile Mapper
 *
 * Responsibilities:
 * - Transform PlayerProfile database entity into API response DTO
 * - Prevent accidental exposure of internal fields
 * - Maintain stable API response contract
 * - Provide separate authenticated and public profile representations
 * -----------------------------------------------------------------------------
 */

class PlayerProfileMapper {
  /**
   * ---------------------------------------------------------------------------
   * Map PlayerProfile Entity -> Authenticated Profile Response
   * ---------------------------------------------------------------------------
   *
   * Used for:
   * GET /api/v1/users/me/player-profile
   * PATCH /api/v1/users/me/player-profile
   */
  static toProfileResponse(playerProfile) {
    if (!playerProfile) {
      return null;
    }

    return {
      id: playerProfile.id,
      userId: playerProfile.userId ?? null,
      displayName: playerProfile.displayName ?? null,
      playingRole: playerProfile.playingRole ?? null,
      battingStyle: playerProfile.battingStyle ?? null,
      bowlingStyle: playerProfile.bowlingStyle ?? null,
      bio: playerProfile.bio ?? null,
      createdAt: playerProfile.createdAt ?? null,
      updatedAt: playerProfile.updatedAt ?? null,
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Map PlayerProfile Entity -> Public Player Profile
   * ---------------------------------------------------------------------------
   *
   * Intended for future public player profile endpoints.
   * Internal ownership fields are intentionally excluded.
   */
  static toPublicProfile(playerProfile) {
    if (!playerProfile) {
      return null;
    }

    return {
      id: playerProfile.id,
      displayName: playerProfile.displayName ?? null,
      playingRole: playerProfile.playingRole ?? null,
      battingStyle: playerProfile.battingStyle ?? null,
      bowlingStyle: playerProfile.bowlingStyle ?? null,
      bio: playerProfile.bio ?? null,
    };
  }
}

export default PlayerProfileMapper;
