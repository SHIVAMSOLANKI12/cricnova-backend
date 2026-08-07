/**
 * -----------------------------------------------------------------------------
 * File: logout.test.js
 * Description: Integration Tests for Logout Endpoint (POST /api/v1/auth/logout)
 * -----------------------------------------------------------------------------
 */

import logoutService from '../../../src/modules/auth/services/logout.service.js';

describe('POST /api/v1/auth/logout', () => {
  it('should throw AppError when attempting to logout with invalid refresh token', async () => {
    const invalidRefreshToken = 'non-existent-refresh-token';

    await expect(logoutService.execute(invalidRefreshToken)).rejects.toThrow();
  });
});
