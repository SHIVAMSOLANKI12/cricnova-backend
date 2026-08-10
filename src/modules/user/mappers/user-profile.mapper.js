/**
 * -----------------------------------------------------------------------------
 * File: user-profile.mapper.js
 * Description:
 * Enterprise User Profile Mapper
 *
 * Responsibilities:
 * - Transform database User entity into public profile DTO
 * - Prevent accidental exposure of internal fields
 * - Maintain stable API response contract
 *
 * NOTE:
 * - No Prisma
 * - No Database queries
 * - No Business logic
 * - No Express
 * -----------------------------------------------------------------------------
 */

class UserProfileMapper {
  /**
   * ---------------------------------------------------------------------------
   * Map User Entity -> Authenticated Profile Response
   * ---------------------------------------------------------------------------
   *
   * Used by:
   * GET /api/v1/users/me
   * PATCH /api/v1/users/me/profile
   */
  static toProfileResponse(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,

      phone: user.phone ?? null,

      email: user.email ?? null,

      username: user.username ?? null,

      firstName: user.firstName ?? null,

      lastName: user.lastName ?? null,

      city: user.city ?? null,

      gender: user.gender ?? null,

      profileImageUrl: user.profileImageUrl ?? null,

      avatarId: user.avatarId ?? null,

      dateOfBirth: user.dateOfBirth ?? null,

      preferredLanguage: user.preferredLanguage ?? null,

      profileCompleted: user.profileCompleted === true,

      phoneVerified: user.phoneVerified === true,

      emailVerified: user.emailVerified === true,

      status: user.status ?? null,

      createdAt: user.createdAt ?? null,

      updatedAt: user.updatedAt ?? null,
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Map User Entity -> Public Profile
   * ---------------------------------------------------------------------------
   *
   * This method is intended for:
   * - Player profile
   * - Team member profile
   * - Public cricket profile
   *
   * Sensitive account information such as:
   * phone, email and verification flags are intentionally excluded.
   */
  static toPublicProfile(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,

      username: user.username ?? null,

      firstName: user.firstName ?? null,

      lastName: user.lastName ?? null,

      city: user.city ?? null,

      gender: user.gender ?? null,

      profileImageUrl: user.profileImageUrl ?? null,

      avatarId: user.avatarId ?? null,

      profileCompleted: user.profileCompleted === true,
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Map Minimal User Identity
   * ---------------------------------------------------------------------------
   *
   * Useful for:
   * - Match participants
   * - Team members
   * - Notifications
   * - Leaderboards
   */
  static toIdentity(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,

      username: user.username ?? null,

      firstName: user.firstName ?? null,

      lastName: user.lastName ?? null,

      profileImageUrl: user.profileImageUrl ?? null,

      avatarId: user.avatarId ?? null,
    };
  }
}

export default UserProfileMapper;
