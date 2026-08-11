/**
 * -----------------------------------------------------------------------------
 * File: update-photo.test.js
 * Description:
 * User Profile Photo Update Service Integration Tests
 *
 * Responsibilities:
 * - Verify authenticated profile photo update workflow
 * - Verify photo validation
 * - Verify Cloudinary upload integration contract
 * - Verify old photo cleanup
 * - Verify distributed transaction compensation
 * - Verify profile completion calculation
 * - Verify storage metadata persistence
 * - Verify sanitized DTO response
 *
 * IMPORTANT:
 * - PostgreSQL test database is used.
 * - Cloudinary network calls are NOT performed.
 * - Cloudinary provider is mocked/spied.
 * - Tests follow the project's existing direct-service testing convention.
 * -----------------------------------------------------------------------------
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import prisma from '../../../src/core/database/prisma.client.js';

import userRepository from '../../../src/modules/auth/repositories/user.repository.js';
import userProfileRepository from '../../../src/modules/user/repositories/user-profile.repository.js';

import cloudinaryStorageProvider from '../../../src/storage/providers/cloudinary-storage.provider.js';

import updatePhotoService from '../../../src/modules/user/services/update-photo.service.js';

/**
 * -----------------------------------------------------------------------------
 * Test Helpers
 * -----------------------------------------------------------------------------
 */

/**
 * Generate a unique phone number for every test user.
 */
function generateUniquePhone() {
  const timestamp = Date.now().toString().slice(-8);

  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');

  return `9${timestamp}${random}`;
}

/**
 * -----------------------------------------------------------------------------
 * Create Test User
 * -----------------------------------------------------------------------------
 *
 * The existing project uses userRepository.create() for test-user creation.
 */
async function createTestUser(overrides = {}) {
  return userRepository.create({
    phone: generateUniquePhone(),

    status: 'ACTIVE',

    profileCompleted: false,

    ...overrides,
  });
}

/**
 * -----------------------------------------------------------------------------
 * Delete Test User
 * -----------------------------------------------------------------------------
 */
async function deleteTestUser(userId) {
  if (!userId) {
    return;
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}

/**
 * -----------------------------------------------------------------------------
 * Valid JPEG Test Buffer
 * -----------------------------------------------------------------------------
 *
 * upload.middleware/photo.validation only needs a valid JPEG signature.
 *
 * FF D8 FF = JPEG magic bytes.
 */
function createValidJpegBuffer() {
  return Buffer.from([
    0xff,
    0xd8,
    0xff,

    /**
     * Minimal JPEG-like payload for the current validation layer.
     */
    0xdb,
    0x00,
    0x43,
    0x00,

    ...new Array(100).fill(0x00),

    0xff,
    0xd9,
  ]);
}

/**
 * -----------------------------------------------------------------------------
 * Build Valid Uploaded File
 * -----------------------------------------------------------------------------
 */
function createValidPhotoFile() {
  const buffer = createValidJpegBuffer();

  return {
    fieldname: 'photo',

    originalname: 'profile.jpg',

    encoding: '7bit',

    mimetype: 'image/jpeg',

    size: buffer.length,

    destination: '',

    filename: '',

    path: '',

    buffer,
  };
}

/**
 * -----------------------------------------------------------------------------
 * Mock Cloudinary Result
 * -----------------------------------------------------------------------------
 */
function createUploadedAsset(suffix = 'new') {
  return {
    key: `cricnova/users/test/profile/${suffix}`,

    publicId: `cricnova/users/test/profile/${suffix}`,

    url: `https://res.cloudinary.com/test/image/upload/${suffix}.jpg`,

    mimeType: 'image/jpeg',

    size: createValidJpegBuffer().length,

    width: 500,

    height: 500,

    format: 'jpg',

    resourceType: 'image',
  };
}

describe('UpdatePhotoService', () => {
  let createdUserIds = [];

  let uploadSpy;

  let deleteSpy;

  beforeEach(() => {
    /**
     * -----------------------------------------------------------------------
     * Mock Cloudinary Upload
     * -----------------------------------------------------------------------
     *
     * No real network request is made.
     */
    uploadSpy = jest
      .spyOn(cloudinaryStorageProvider, 'upload')
      .mockResolvedValue(createUploadedAsset());

    /**
     * -----------------------------------------------------------------------
     * Mock Cloudinary Delete
     * -----------------------------------------------------------------------
     */
    deleteSpy = jest.spyOn(cloudinaryStorageProvider, 'delete').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    /**
     * -----------------------------------------------------------------------
     * Database Cleanup
     * -----------------------------------------------------------------------
     */
    for (const userId of createdUserIds) {
      try {
        await deleteTestUser(userId);
      } catch {
        /**
         * User may already have been deleted.
         */
      }
    }

    createdUserIds = [];
  });

  /**
   * -------------------------------------------------------------------------
   * Test 1
   * Missing User ID
   * -------------------------------------------------------------------------
   */
  it('should reject when userId is missing', async () => {
    await expect(
      updatePhotoService.execute({
        file: createValidPhotoFile(),
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 2
   * User Not Found
   * -------------------------------------------------------------------------
   */
  it('should reject when user does not exist', async () => {
    const userId = '00000000-0000-0000-0000-000000000000';

    await expect(
      updatePhotoService.execute({
        userId,

        file: createValidPhotoFile(),
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 3
   * Inactive User
   * -------------------------------------------------------------------------
   */
  it('should reject inactive users', async () => {
    const user = await createTestUser({
      status: 'SUSPENDED',
    });

    createdUserIds.push(user.id);

    await expect(
      updatePhotoService.execute({
        userId: user.id,

        file: createValidPhotoFile(),
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 4
   * Missing File
   * -------------------------------------------------------------------------
   */
  it('should reject when photo file is missing', async () => {
    const user = await createTestUser();

    createdUserIds.push(user.id);

    await expect(
      updatePhotoService.execute({
        userId: user.id,
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 5
   * Unsupported MIME Type
   * -------------------------------------------------------------------------
   */
  it('should reject unsupported image types', async () => {
    const user = await createTestUser();

    createdUserIds.push(user.id);

    const file = createValidPhotoFile();

    file.mimetype = 'application/pdf';

    await expect(
      updatePhotoService.execute({
        userId: user.id,

        file,
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 6
   * Oversized File
   * -------------------------------------------------------------------------
   */
  it('should reject oversized profile photos', async () => {
    const user = await createTestUser();

    createdUserIds.push(user.id);

    const file = createValidPhotoFile();

    file.size = 5 * 1024 * 1024 + 1;

    await expect(
      updatePhotoService.execute({
        userId: user.id,

        file,
      })
    ).rejects.toThrow();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 7
   * First Photo Upload
   * -------------------------------------------------------------------------
   */
  it("should upload and persist a user's first profile photo", async () => {
    const user = await createTestUser({
      firstName: 'Rahul',

      city: 'Mumbai',

      gender: 'MALE',

      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),

      avatarId: null,

      profileImageUrl: null,

      profileImagePublicId: null,
    });

    createdUserIds.push(user.id);

    const asset = createUploadedAsset('first-photo');

    uploadSpy.mockResolvedValueOnce(asset);

    const result = await updatePhotoService.execute({
      userId: user.id,

      file: createValidPhotoFile(),
    });

    /**
     * Service returns sanitized DTO.
     */
    expect(result.profileImageUrl).toBe(asset.url);

    expect(result.profileCompleted).toBe(true);

    /**
     * Internal storage ID must NOT leak.
     */
    expect(result.profileImagePublicId).toBeUndefined();

    /**
     * Verify database state.
     */
    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        profileImageUrl: true,

        profileImagePublicId: true,

        profileCompleted: true,
      },
    });

    expect(updatedUser.profileImageUrl).toBe(asset.url);

    expect(updatedUser.profileImagePublicId).toBe(asset.publicId);

    expect(updatedUser.profileCompleted).toBe(true);

    expect(uploadSpy).toHaveBeenCalledTimes(1);

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 8
   * Photo Replacement
   * -------------------------------------------------------------------------
   */
  it('should replace an existing profile photo and delete the old asset', async () => {
    const oldPublicId = 'cricnova/users/test/profile/old-photo';

    const oldUrl = 'https://res.cloudinary.com/test/old.jpg';

    const user = await createTestUser({
      firstName: 'Rahul',

      city: 'Mumbai',

      gender: 'MALE',

      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),

      profileImageUrl: oldUrl,

      profileImagePublicId: oldPublicId,
    });

    createdUserIds.push(user.id);

    const newAsset = createUploadedAsset('new-photo');

    uploadSpy.mockResolvedValueOnce(newAsset);

    const result = await updatePhotoService.execute({
      userId: user.id,

      file: createValidPhotoFile(),
    });

    expect(result.profileImageUrl).toBe(newAsset.url);

    expect(deleteSpy).toHaveBeenCalledTimes(1);

    expect(deleteSpy).toHaveBeenCalledWith({
      key: oldPublicId,
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        profileImageUrl: true,

        profileImagePublicId: true,
      },
    });

    expect(updatedUser.profileImageUrl).toBe(newAsset.url);

    expect(updatedUser.profileImagePublicId).toBe(newAsset.publicId);
  });

  /**
   * -------------------------------------------------------------------------
   * Test 9
   * DB Failure Compensation
   * -------------------------------------------------------------------------
   */
  it('should delete the newly uploaded asset when database persistence fails', async () => {
    const user = await createTestUser();

    createdUserIds.push(user.id);

    const newAsset = createUploadedAsset('orphan-risk');

    uploadSpy.mockResolvedValueOnce(newAsset);

    /**
     * Force repository persistence failure.
     *
     * This simulates PostgreSQL transaction failure AFTER Cloudinary upload.
     */
    const updateProfileSpy = jest
      .spyOn(userProfileRepository, 'updateProfile')
      .mockRejectedValueOnce(new Error('Simulated database failure'));

    await expect(
      updatePhotoService.execute({
        userId: user.id,

        file: createValidPhotoFile(),
      })
    ).rejects.toThrow('Simulated database failure');

    /**
     * Newly uploaded asset must be compensated.
     */
    expect(deleteSpy).toHaveBeenCalledWith({
      key: newAsset.publicId,
    });

    expect(updateProfileSpy).toHaveBeenCalled();

    updateProfileSpy.mockRestore();
  });

  /**
   * -------------------------------------------------------------------------
   * Test 10
   * Old Asset Cleanup Failure
   * -------------------------------------------------------------------------
   */
  it('should keep database state successful when old asset cleanup fails', async () => {
    const oldPublicId = 'cricnova/users/test/profile/old-cleanup-failure';

    const user = await createTestUser({
      firstName: 'Rahul',

      city: 'Mumbai',

      gender: 'MALE',

      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),

      profileImageUrl: 'https://res.cloudinary.com/test/old.jpg',

      profileImagePublicId: oldPublicId,
    });

    createdUserIds.push(user.id);

    const newAsset = createUploadedAsset('cleanup-failure');

    uploadSpy.mockResolvedValueOnce(newAsset);

    deleteSpy.mockRejectedValueOnce(new Error('Simulated Cloudinary cleanup failure'));

    const result = await updatePhotoService.execute({
      userId: user.id,

      file: createValidPhotoFile(),
    });

    /**
     * DB state must remain successful.
     */
    expect(result.profileImageUrl).toBe(newAsset.url);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        profileImageUrl: true,

        profileImagePublicId: true,
      },
    });

    expect(updatedUser.profileImageUrl).toBe(newAsset.url);

    expect(updatedUser.profileImagePublicId).toBe(newAsset.publicId);
  });

  /**
   * -------------------------------------------------------------------------
   * Test 11
   * Completion Remains False
   * -------------------------------------------------------------------------
   */
  it('should keep profile incomplete when required onboarding fields are missing', async () => {
    const user = await createTestUser({
      firstName: 'Rahul',

      city: null,

      gender: null,

      dateOfBirth: null,

      profileImageUrl: null,

      profileImagePublicId: null,

      avatarId: null,
    });

    createdUserIds.push(user.id);

    const asset = createUploadedAsset('incomplete-profile');

    uploadSpy.mockResolvedValueOnce(asset);

    const result = await updatePhotoService.execute({
      userId: user.id,

      file: createValidPhotoFile(),
    });

    expect(result.profileCompleted).toBe(false);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        profileCompleted: true,
      },
    });

    expect(updatedUser.profileCompleted).toBe(false);
  });

  /**
   * -------------------------------------------------------------------------
   * Test 12
   * Client Cannot Control profileCompleted
   * -------------------------------------------------------------------------
   *
   * updatePhotoService receives only userId + file.
   *
   * Therefore profileCompleted cannot be client-controlled.
   */
  it('should calculate profileCompleted exclusively on the server', async () => {
    const user = await createTestUser({
      firstName: 'Rahul',

      city: 'Mumbai',

      gender: 'MALE',

      dateOfBirth: new Date('2000-05-20T00:00:00.000Z'),

      profileCompleted: false,
    });

    createdUserIds.push(user.id);

    const asset = createUploadedAsset('server-completion');

    uploadSpy.mockResolvedValueOnce(asset);

    const result = await updatePhotoService.execute({
      userId: user.id,

      file: createValidPhotoFile(),
    });

    expect(result.profileCompleted).toBe(true);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        profileCompleted: true,
      },
    });

    expect(updatedUser.profileCompleted).toBe(true);
  });
});
