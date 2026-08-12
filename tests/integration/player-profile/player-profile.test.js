/**
 * -----------------------------------------------------------------------------
 * File: player-profile.test.js
 * Description:
 * Cricket Player Profile Domain Integration Tests
 *
 * Responsibilities:
 * - Verify PlayerProfile retrieval (GET /me/player-profile)
 * - Verify PlayerProfile first-time creation vs update (PATCH)
 * - Verify single-profile 1-to-1 uniqueness constraint
 * - Verify PATCH partial-update semantics (preserves unsupplied fields)
 * - Verify security isolation (client cannot override userId)
 * - Verify cleanup after test execution
 * -----------------------------------------------------------------------------
 */

import playerProfileService from '../../../src/modules/player-profile/services/player-profile.service.js';
import playerProfileRepository from '../../../src/modules/player-profile/repositories/player-profile.repository.js';
import userRepository from '../../../src/modules/auth/repositories/user.repository.js';
import prisma from '../../../src/core/database/prisma.client.js';

describe('PlayerProfile Domain Service & Repository Integration', () => {
  /**
   * Helper: Create Test User
   */
  const createTestUser = async (overrides = {}) => {
    const uniqueVal = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return userRepository.create({
      phone: `9${uniqueVal.replace(/\D/g, '').slice(-9)}`,
      status: 'ACTIVE',
      firstName: 'Player',
      lastName: 'Test',
      ...overrides,
    });
  };

  /**
   * Helper: Delete Test User & Player Profile (Cascade)
   */
  const deleteTestUser = async (userId) => {
    if (!userId) {
      return;
    }
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch {
      // Ignore if already deleted
    }
  };

  /**
   * ---------------------------------------------------------------------------
   * 1. GET Player Profile Tests
   * ---------------------------------------------------------------------------
   */
  describe('getMyPlayerProfile', () => {
    it('should throw when userId is missing', async () => {
      await expect(playerProfileService.getMyPlayerProfile()).rejects.toThrow();
    });

    it('should throw RESOURCE_NOT_FOUND when user has no PlayerProfile', async () => {
      const user = await createTestUser();
      try {
        await expect(playerProfileService.getMyPlayerProfile(user.id)).rejects.toThrow();
      } finally {
        await deleteTestUser(user.id);
      }
    });

    it('should return PlayerProfile DTO when profile exists', async () => {
      const user = await createTestUser();
      try {
        await playerProfileService.updateMyPlayerProfile(user.id, {
          displayName: 'Virats Fan',
          playingRole: 'BATTER',
          battingStyle: 'RIGHT_HAND',
        });

        const profile = await playerProfileService.getMyPlayerProfile(user.id);

        expect(profile).toBeTruthy();
        expect(profile.displayName).toBe('Virats Fan');
        expect(profile.playingRole).toBe('BATTER');
        expect(profile.battingStyle).toBe('RIGHT_HAND');
        expect(profile.userId).toBe(user.id);
      } finally {
        await deleteTestUser(user.id);
      }
    });
  });

  /**
   * ---------------------------------------------------------------------------
   * 2. PATCH Player Profile & Uniqueness Tests
   * ---------------------------------------------------------------------------
   */
  describe('updateMyPlayerProfile', () => {
    it('should throw when userId is missing', async () => {
      await expect(
        playerProfileService.updateMyPlayerProfile(null, {
          displayName: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should throw when data is empty object', async () => {
      const user = await createTestUser();
      try {
        await expect(playerProfileService.updateMyPlayerProfile(user.id, {})).rejects.toThrow();
      } finally {
        await deleteTestUser(user.id);
      }
    });

    it('should create a new PlayerProfile on first PATCH request', async () => {
      const user = await createTestUser();
      try {
        const created = await playerProfileService.updateMyPlayerProfile(user.id, {
          displayName: 'Shivam Allrounder',
          playingRole: 'ALL_ROUNDER',
          battingStyle: 'RIGHT_HAND',
          bowlingStyle: 'RIGHT_ARM_MEDIUM',
          bio: 'Lead allrounder',
        });

        expect(created).toBeTruthy();
        expect(created.id).toBeDefined();
        expect(created.displayName).toBe('Shivam Allrounder');
        expect(created.playingRole).toBe('ALL_ROUNDER');
        expect(created.battingStyle).toBe('RIGHT_HAND');
        expect(created.bowlingStyle).toBe('RIGHT_ARM_MEDIUM');
        expect(created.bio).toBe('Lead allrounder');

        // Verify DB persistence
        const dbRecord = await playerProfileRepository.findByUserId(user.id);
        expect(dbRecord).toBeTruthy();
        expect(dbRecord.displayName).toBe('Shivam Allrounder');
      } finally {
        await deleteTestUser(user.id);
      }
    });

    it('should enforce 1-to-1 uniqueness (create on 1st PATCH, update on 2nd PATCH)', async () => {
      const user = await createTestUser();
      try {
        // First PATCH -> CREATE
        await playerProfileService.updateMyPlayerProfile(user.id, {
          displayName: 'First Name',
          playingRole: 'BATTER',
        });

        // Second PATCH -> UPDATE
        await playerProfileService.updateMyPlayerProfile(user.id, {
          displayName: 'Second Name',
        });

        // Check DB count for this user
        const count = await prisma.playerProfile.count({
          where: { userId: user.id },
        });

        expect(count).toBe(1);

        const updated = await playerProfileRepository.findByUserId(user.id);
        expect(updated.displayName).toBe('Second Name');
      } finally {
        await deleteTestUser(user.id);
      }
    });

    it('should preserve existing fields during partial PATCH update', async () => {
      const user = await createTestUser();
      try {
        // Setup initial full profile
        await playerProfileService.updateMyPlayerProfile(user.id, {
          displayName: 'Original Name',
          playingRole: 'ALL_ROUNDER',
          battingStyle: 'RIGHT_HAND',
          bowlingStyle: 'RIGHT_ARM_FAST',
          bio: 'Original bio',
        });

        // Partial PATCH update: ONLY update playingRole
        const updated = await playerProfileService.updateMyPlayerProfile(user.id, {
          playingRole: 'BATTER',
        });

        // Verify updated field
        expect(updated.playingRole).toBe('BATTER');

        // Verify preserved fields
        expect(updated.displayName).toBe('Original Name');
        expect(updated.battingStyle).toBe('RIGHT_HAND');
        expect(updated.bowlingStyle).toBe('RIGHT_ARM_FAST');
        expect(updated.bio).toBe('Original bio');
      } finally {
        await deleteTestUser(user.id);
      }
    });

    it('should ignore spoofed userId in body payload and strictly enforce authenticated user ownership', async () => {
      const userA = await createTestUser();
      const userB = await createTestUser();
      try {
        // User A updates profile but tries to pass spoofed userB.id in body
        const updated = await playerProfileService.updateMyPlayerProfile(userA.id, {
          userId: userB.id, // Should be ignored
          displayName: 'User A Profile',
          playingRole: 'BOWLER',
        });

        // Profile created MUST belong to User A
        expect(updated.userId).toBe(userA.id);

        // User B must still have NO profile
        const userBProfile = await playerProfileRepository.findByUserId(userB.id);
        expect(userBProfile).toBeNull();
      } finally {
        await deleteTestUser(userA.id);
        await deleteTestUser(userB.id);
      }
    });
  });
});
