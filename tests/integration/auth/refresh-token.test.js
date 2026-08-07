/**
 * -----------------------------------------------------------------------------
 * File: refresh-token.test.js
 * Description: Integration Tests for Refresh Token Endpoint (POST /api/v1/auth/refresh-token)
 * -----------------------------------------------------------------------------
 */

import refreshTokenService from '../../../src/modules/auth/services/refresh-token.service.js';

describe('POST /api/v1/auth/refresh-token', () => {
  it('should throw AppError on invalid or non-existent refresh token', async () => {
    const invalidRefreshToken = 'invalid.token.hash';

    await expect(refreshTokenService.execute(invalidRefreshToken)).rejects.toThrow();
  });
});
