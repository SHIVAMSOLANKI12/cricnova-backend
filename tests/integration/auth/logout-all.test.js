/**
 * -----------------------------------------------------------------------------
 * File: logout-all.test.js
 * Description: Integration Tests for Logout All Devices Endpoint (POST /api/v1/auth/logout-all)
 * -----------------------------------------------------------------------------
 */

import logoutAllService from '../../../src/modules/auth/services/logout-all.service.js';

describe('POST /api/v1/auth/logout-all', () => {
  it('should successfully execute logout-all for a user payload', async () => {
    const payload = { userId: 'c8f5d0a1-4e78-4a90-8e12-3456789abcde' };

    const result = await logoutAllService.execute(payload);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
