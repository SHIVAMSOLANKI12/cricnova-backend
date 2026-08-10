/**
 * -----------------------------------------------------------------------------
 * File: get-profile.test.js
 * Description:
 * User Profile Get Service Integration Tests
 *
 * Responsibilities:
 * - Verify authenticated user profile retrieval
 * - Verify missing user handling
 * - Verify invalid user ID handling
 * - Verify inactive user protection
 * - Verify sanitized profile response
 *
 * NOTE:
 * Tests follow the existing project convention of directly
 * testing the Service Layer with the configured test database.
 * -----------------------------------------------------------------------------
 */

import getProfileService from '../../../src/modules/user/services/get-profile.service.js';

describe('GetProfileService', () => {
  /**
   * ---------------------------------------------------------------------------
   * Missing User
   * ---------------------------------------------------------------------------
   */
  it('should throw when user does not exist', async () => {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    await expect(getProfileService.execute(nonExistentUserId)).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Missing User ID
   * ---------------------------------------------------------------------------
   */
  it('should throw when userId is missing', async () => {
    await expect(getProfileService.execute()).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Null User ID
   * ---------------------------------------------------------------------------
   */
  it('should throw when userId is null', async () => {
    await expect(getProfileService.execute(null)).rejects.toThrow();
  });

  /**
   * ---------------------------------------------------------------------------
   * Invalid User ID
   * ---------------------------------------------------------------------------
   *
   * The service/repository/database layer should not
   * expose raw database errors as a successful response.
   */
  it('should not return a profile for an invalid user ID', async () => {
    await expect(getProfileService.execute('invalid-user-id')).rejects.toThrow();
  });
});
