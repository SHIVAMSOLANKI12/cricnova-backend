/**
 * -----------------------------------------------------------------------------
 * File: update-profile.test.js
 * Description:
 * User Profile Update Service Integration Tests
 *
 * Responsibilities:
 * - Verify profile updates against the test database
 * - Verify server-controlled profile completion
 * - Verify DOB requirement
 * - Verify avatar/photo requirement
 * - Verify partial update behavior
 *
 * NOTE:
 * - Direct Service Layer testing follows the existing project convention.
 * - Database state is verified after mutations.
 * - No HTTP/Express dependency.
 * -----------------------------------------------------------------------------
 */

import updateProfileService from '../../../src/modules/user/services/update-profile.service.js';
import userRepository from '../../../src/modules/auth/repositories/user.repository.js';
import prisma from '../../../src/core/database/prisma.client.js';

describe('UpdateProfileService', () => {
  /**
   * ---------------------------------------------------------------------------
   * Test User Factory
   * ---------------------------------------------------------------------------
   *
   * IMPORTANT:
   * Keep this factory aligned with the authoritative User Prisma schema.
   *
   * If your existing test suite already has a user factory/helper,
   * prefer that helper instead of duplicating this function.
   */
  const createTestUser = async (overrides = {}) => {
    const uniqueValue = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return userRepository.create({
      phone: `9${uniqueValue.replace(/\D/g, '').slice(-9)}`,

      status: 'ACTIVE',

      firstName: null,

      lastName: null,

      city: null,

      gender: null,

      profileImageUrl: null,

      avatarId: null,

      dateOfBirth: null,

      preferredLanguage: null,

      profileCompleted: false,

      ...overrides,
    });
  };

  /**
   * ---------------------------------------------------------------------------
   * Cleanup Helper
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
   * Test 1: Non-existent User
   * ---------------------------------------------------------------------------
   */
  it('should throw when user does not exist', async () => {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    await expect(
      updateProfileService.execute({
        userId: nonExistentUserId,

        data: {
          firstName: 'Rahul',
        },
      })
    ).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 2: Missing User ID
   * ---------------------------------------------------------------------------
   */
  it('should throw when userId is missing', async () => {
    await expect(
      updateProfileService.execute({
        data: {
          firstName: 'Rahul',
        },
      })
    ).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 3: Missing Profile Data
   * ---------------------------------------------------------------------------
   */
  it('should throw when profile data is missing', async () => {
    await expect(
      updateProfileService.execute({
        userId: '00000000-0000-0000-0000-000000000000',
      })
    ).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 4: Client Cannot Control profileCompleted
   * ---------------------------------------------------------------------------
   *
   * IMPORTANT:
   * The service must never trust profileCompleted from the client.
   */
  it('should not allow the client to control profileCompleted', async () => {
    const user = await createTestUser();

    try {
      await expect(
        updateProfileService.execute({
          userId: user.id,

          data: {
            firstName: 'Rahul',
            profileCompleted: true,
          },
        })
      ).rejects.toThrow();

      const persistedUser = await userRepository.findActiveUserById(user.id);

      expect(persistedUser.profileCompleted).toBe(false);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 5: Partial Profile Update
   * ---------------------------------------------------------------------------
   *
   * PATCH semantics:
   * Only supplied fields should change.
   */
  it('should update only supplied profile fields', async () => {
    const user = await createTestUser({
      firstName: 'OldName',
      city: 'OldCity',
    });

    try {
      const result = await updateProfileService.execute({
        userId: user.id,

        data: {
          firstName: 'Rahul',
        },
      });

      expect(result.firstName).toBe('Rahul');

      expect(result.city).toBe('OldCity');

      expect(result.profileCompleted).toBe(false);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 6: Missing DOB
   * ---------------------------------------------------------------------------
   *
   * Completion rule:
   *
   * firstName
   * + city
   * + gender
   * + DOB
   * + avatar/photo
   *
   * Without DOB => false
   */
  it('should keep profileCompleted false when DOB is missing', async () => {
    const user = await createTestUser();

    try {
      const result = await updateProfileService.execute({
        userId: user.id,

        data: {
          firstName: 'Rahul',
          city: 'Mumbai',
          gender: 'MALE',
          avatarId: 'batsman_blue_01',
        },
      });

      expect(result.profileCompleted).toBe(false);

      const persistedUser = await userRepository.findActiveUserById(user.id);

      expect(persistedUser.profileCompleted).toBe(false);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 7: Missing Avatar And Photo
   * ---------------------------------------------------------------------------
   */
  it('should keep profileCompleted false when avatar and photo are missing', async () => {
    const user = await createTestUser();

    try {
      const result = await updateProfileService.execute({
        userId: user.id,

        data: {
          firstName: 'Rahul',
          city: 'Mumbai',
          gender: 'MALE',
          dateOfBirth: '2000-05-20',
        },
      });

      expect(result.profileCompleted).toBe(false);

      const persistedUser = await userRepository.findActiveUserById(user.id);

      expect(persistedUser.profileCompleted).toBe(false);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 8: Complete Profile With Avatar
   * ---------------------------------------------------------------------------
   */
  it('should mark profileCompleted true when all required fields are present and avatar exists', async () => {
    const user = await createTestUser();

    try {
      const result = await updateProfileService.execute({
        userId: user.id,

        data: {
          firstName: 'Rahul',
          city: 'Mumbai',
          gender: 'MALE',
          dateOfBirth: '2000-05-20',
          avatarId: 'batsman_blue_01',
        },
      });

      expect(result.profileCompleted).toBe(true);

      const persistedUser = await userRepository.findActiveUserById(user.id);

      expect(persistedUser.profileCompleted).toBe(true);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 9: Complete Profile With Photo
   * ---------------------------------------------------------------------------
   */
  it('should mark profileCompleted true when all required fields are present and profile photo exists', async () => {
    const user = await createTestUser();

    try {
      const result = await updateProfileService.execute({
        userId: user.id,

        data: {
          firstName: 'Rahul',
          city: 'Mumbai',
          gender: 'MALE',
          dateOfBirth: '2000-05-20',
          profileImageUrl: 'https://cdn.example.com/profile/rahul.jpg',
        },
      });

      expect(result.profileCompleted).toBe(true);

      expect(result.profileImageUrl).toBe('https://cdn.example.com/profile/rahul.jpg');
    } finally {
      await deleteTestUser(user.id);
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * Test 10: Invalid Account Status
   * ---------------------------------------------------------------------------
   */
  it('should reject profile update for inactive user', async () => {
    const user = await createTestUser({
      status: 'SUSPENDED',
    });

    try {
      await expect(
        updateProfileService.execute({
          userId: user.id,

          data: {
            firstName: 'Rahul',
          },
        })
      ).rejects.toThrow();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
