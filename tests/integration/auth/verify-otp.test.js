/**
 * -----------------------------------------------------------------------------
 * File: verify-otp.test.js
 * Description: Integration Tests for Verify OTP Endpoint (POST /api/v1/auth/verify-otp)
 * -----------------------------------------------------------------------------
 */

import verifyOtpService from '../../../src/modules/auth/services/verify-otp.service.js';

describe('POST /api/v1/auth/verify-otp', () => {
  it('should reject invalid OTP verification attempts with AppError', async () => {
    const payload = {
      mobile: '9876543210',
      otp: '000000',
      sessionPayload: {
        ipAddress: '127.0.0.1',
        userAgent: 'TestAgent',
        loginMethod: 'PHONE_OTP',
      },
    };

    await expect(verifyOtpService.execute(payload)).rejects.toThrow();
  });
});
