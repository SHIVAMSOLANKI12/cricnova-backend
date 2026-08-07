/**
 * -----------------------------------------------------------------------------
 * File: send-otp.test.js
 * Description: Integration Tests for Send OTP Endpoint (POST /api/v1/auth/send-otp)
 * -----------------------------------------------------------------------------
 */

import sendOtpService from '../../../src/modules/auth/services/send-otp.service.js';

describe('POST /api/v1/auth/send-otp', () => {
  it('should successfully send OTP to a valid Indian mobile number', async () => {
    const payload = { mobile: '9876543210' };
    const result = await sendOtpService.execute(payload);

    expect(result).toBeDefined();
    expect(result.target ?? result.mobile).toBeDefined();
  });

  it('should throw error when mobile number format is invalid', async () => {
    const invalidPayload = { mobile: '12345' };

    await expect(sendOtpService.execute(invalidPayload)).rejects.toThrow();
  });
});
