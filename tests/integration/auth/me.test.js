/**
 * -----------------------------------------------------------------------------
 * File: me.test.js
 * Description: Integration Tests for Get Current User Endpoint (GET /api/v1/auth/me)
 * -----------------------------------------------------------------------------
 */

import getCurrentUserService from '../../../src/modules/auth/services/get-current-user.service.js';

describe('GET /api/v1/auth/me', () => {
  it('should throw AppError when user ID does not exist in database', async () => {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    await expect(getCurrentUserService.execute(nonExistentUserId)).rejects.toThrow();
  });
});
