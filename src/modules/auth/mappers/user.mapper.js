/**
 * -----------------------------------------------------------------------------
 * File: user.mapper.js
 * Description:
 * Enterprise User Mapper (DTO Transformation)
 *
 * Responsibilities:
 * - Sanitize User Profile Output
 * - Format Profile API Contract
 * -----------------------------------------------------------------------------
 */

class UserMapper {
  /**
   * Transform User entity to safe public Profile DTO
   */
  static toProfileResponse(user, roles = [], permissions = []) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl ?? user.profileImage ?? null,
      status: user.status,
      phoneVerified: user.phoneVerified ?? false,
      emailVerified: user.emailVerified ?? false,
      profileCompleted: user.profileCompleted ?? false,
      roles: roles ?? [],
      permissions: permissions ?? [],
      createdAt: user.createdAt,
    };
  }
}

export default UserMapper;
