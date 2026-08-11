/**
 * -----------------------------------------------------------------------------
 * File: update-avatar.test.js
 * Description:
 * Production Integration Tests for User Avatar Update
 *
 * Responsibilities:
 * - Verify valid avatar updates
 * - Verify invalid avatar rejection
 * - Verify missing user handling
 * - Verify inactive/suspended user protection
 * - Verify profile completion recalculation
 * - Verify existing profile fields are preserved
 * - Verify database state after update
 *
 * NOTE:
 * - Service is tested directly according to project test convention.
 * - Database state is verified after successful mutations.
 * - Every created test user is cleaned up.
 * -----------------------------------------------------------------------------
 */

import updateAvatarService from '../../../src/modules/user/services/update-avatar.service.js';

import userRepository from '../../../src/modules/auth/repositories/user.repository.js';

import prisma from '../../../src/core/database/prisma.client.js';

describe('UpdateAvatarService', () => {
  /**
   * ---------------------------------------------------------------------------
   * Test User Factory
   * ---------------------------------------------------------------------------
   */
  const createTestUser = async (overrides = {}) => {
    const uniqueValue = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return userRepository.create({
      phone: `9${uniqueValue.replace(/\D/g, '').slice(-9)}`,

      status: 'ACTIVE',

      firstName: 'Test',

      lastName: 'User',

      city: 'Mumbai',

      gender: 'MALE',

      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),

      profileImageUrl: null,

      avatarId: null,

      profileCompleted: false,

      ...overrides,
    });
  };

  /**
   * ---------------------------------------------------------------------------
   * Test User Cleanup
   * ---------------------------------------------------------------------------
   */
  const deleteTestUser = async (userId) => {
    if (!userId) {
      return;
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  };

  /**
   * ---------------------------------------------------------------------------
   * Test 1
   * Valid Avatar Update
   * ---------------------------------------------------------------------------
   */
  it("should successfully update the user's avatar", async () => {
    const user = await createTestUser();

    try {
      const result = await updateAvatarService.execute({
        userId: user.id,
        avatarId: 'batsman_blue_01',
      });

      expect(result).toBeDefined();

      expect(result.avatarId).toBe('batsman_blue_01');

      const databaseUser = await userRepository.findById(user.id);

      expect(databaseUser.avatarId).toBe('batsman_blue_01');
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 2
   * Non-existent User
   * ---------------------------------------------------------------------------
   */
  it('should throw when user does not exist', async () => {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    await expect(
      updateAvatarService.execute({
        userId: nonExistentUserId,
        avatarId: 'batsman_blue_01',
      })
    ).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 3
   * Missing User ID
   * ---------------------------------------------------------------------------
   */
  it('should throw when userId is missing', async () => {
    await expect(
      updateAvatarService.execute({
        avatarId: 'batsman_blue_01',
      })
    ).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 4
   * Missing Avatar ID
   * ---------------------------------------------------------------------------
   */
  it('should throw when avatarId is missing', async () => {
    const user = await createTestUser();

    try {
      await expect(
        updateAvatarService.execute({
          userId: user.id,
        })
      ).rejects.toThrow();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 5
   * Invalid Avatar ID
   * ---------------------------------------------------------------------------
   */
  it('should reject an unsupported avatar ID', async () => {
    const user = await createTestUser();

    try {
      await expect(
        updateAvatarService.execute({
          userId: user.id,
          avatarId: 'invalid_avatar_xyz',
        })
      ).rejects.toThrow();

      const databaseUser = await userRepository.findById(user.id);

      expect(databaseUser.avatarId).toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 6
   * Suspended User
   * ---------------------------------------------------------------------------
   */
  it('should reject avatar update for an inactive user', async () => {
    const user = await createTestUser({
      status: 'SUSPENDED',
    });

    try {
      await expect(
        updateAvatarService.execute({
          userId: user.id,
          avatarId: 'batsman_blue_01',
        })
      ).rejects.toThrow();

      const databaseUser = await userRepository.findById(user.id);

      expect(databaseUser.avatarId).toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 7
   * Profile Completion With Avatar
   * ---------------------------------------------------------------------------
   *
   * All required profile fields already exist.
   * Avatar completes the identity requirement.
   */
  it('should mark profileCompleted true when avatar completes the profile', async () => {
    const user = await createTestUser({
      firstName: 'Rahul',
      city: 'Mumbai',
      gender: 'MALE',
      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),
      profileImageUrl: null,
      avatarId: null,
      profileCompleted: false,
    });

    try {
      const result = await updateAvatarService.execute({
        userId: user.id,
        avatarId: 'batsman_blue_01',
      });

      expect(result.profileCompleted).toBe(true);

      const databaseUser = await userRepository.findById(user.id);

      expect(databaseUser.profileCompleted).toBe(true);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 8
   * Profile Remains Incomplete
   * ---------------------------------------------------------------------------
   *
   * Avatar alone must not complete the profile.
   */
  it('should keep profileCompleted false when required profile data is missing', async () => {
    const user = await createTestUser({
      firstName: null,
      city: null,
      gender: null,
      dateOfBirth: null,
      profileImageUrl: null,
      avatarId: null,
      profileCompleted: false,
    });

    try {
      const result = await updateAvatarService.execute({
        userId: user.id,
        avatarId: 'batsman_blue_01',
      });

      expect(result.avatarId).toBe('batsman_blue_01');

      expect(result.profileCompleted).toBe(false);

      const databaseUser = await userRepository.findById(user.id);

      expect(databaseUser.profileCompleted).toBe(false);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 9
   * Existing Profile Photo Should Satisfy Identity Requirement
   * ---------------------------------------------------------------------------
   */
  it('should preserve profile completion when a profile photo already exists', async () => {
    const user = await createTestUser({
      firstName: 'Rahul',
      city: 'Mumbai',
      gender: 'MALE',
      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),
      profileImageUrl: 'https://cdn.example.com/profile/test.jpg',
      avatarId: null,
      profileCompleted: false,
    });

    try {
      const result = await updateAvatarService.execute({
        userId: user.id,
        avatarId: 'batsman_blue_01',
      });

      expect(result.profileImageUrl).toBe('https://cdn.example.com/profile/test.jpg');

      expect(result.avatarId).toBe('batsman_blue_01');

      expect(result.profileCompleted).toBe(true);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 10
   * Existing Profile Fields Must Remain Unchanged
   * ---------------------------------------------------------------------------
   */
  it('should update only avatar-related fields and preserve existing profile data', async () => {
    const user = await createTestUser({
      firstName: 'Rahul',
      lastName: 'Sharma',
      city: 'Mumbai',
      gender: 'MALE',
      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),
      profileImageUrl: null,
      avatarId: 'bowler_blue_01',
      profileCompleted: true,
    });

    try {
      const result = await updateAvatarService.execute({
        userId: user.id,
        avatarId: 'batsman_blue_01',
      });

      expect(result.avatarId).toBe('batsman_blue_01');

      expect(result.firstName).toBe('Rahul');

      expect(result.lastName).toBe('Sharma');

      expect(result.city).toBe('Mumbai');

      expect(result.gender).toBe('MALE');
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
