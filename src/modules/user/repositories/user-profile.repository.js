/**
 * -----------------------------------------------------------------------------
 * File: user-profile.repository.js
 * Description:
 * Enterprise User Profile Repository
 *
 * Responsibilities:
 * - User profile database operations
 * - Transaction-aware profile reads/writes
 * - Profile completion persistence
 *
 * NOTE:
 * - No business logic
 * - No Express
 * - No HTTP response
 * - No validation
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class UserProfileRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  /**
   * ---------------------------------------------------------------------------
   * Find Profile By User ID
   * ---------------------------------------------------------------------------
   */
  async findProfileByUserId(userId, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        gender: true,
        city: true,
        profileImageUrl: true,
        profileImagePublicId: true,
        avatarId: true,
        dateOfBirth: true,
        preferredLanguage: true,
        profileCompleted: true,
        phoneVerified: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Update User Profile
   * ---------------------------------------------------------------------------
   *
   * Only profile fields should be passed to this method.
   */
  async updateProfile(userId, data, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        gender: true,
        city: true,
        profileImageUrl: true,
        profileImagePublicId: true,
        avatarId: true,
        dateOfBirth: true,
        preferredLanguage: true,
        profileCompleted: true,
        phoneVerified: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Update Profile Completion Status
   * ---------------------------------------------------------------------------
   */
  async updateProfileCompletion(userId, profileCompleted, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.update({
      where: {
        id: userId,
      },
      data: {
        profileCompleted,
      },
      select: {
        id: true,
        profileCompleted: true,
        updatedAt: true,
      },
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Update Profile Image
   * ---------------------------------------------------------------------------
   */
  async updateProfileImage(userId, profileImageUrl, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.update({
      where: {
        id: userId,
      },
      data: {
        profileImageUrl,
      },
      select: {
        id: true,
        profileImageUrl: true,
        profileCompleted: true,
        updatedAt: true,
      },
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Update Avatar
   * ---------------------------------------------------------------------------
   */
  async updateAvatar(userId, avatarId, tx = null) {
    const client = tx ? tx.user : this.model;

    return client.update({
      where: {
        id: userId,
      },
      data: {
        avatarId,
      },
      select: {
        id: true,
        avatarId: true,
        profileCompleted: true,
        updatedAt: true,
      },
    });
  }
}

export default new UserProfileRepository();
