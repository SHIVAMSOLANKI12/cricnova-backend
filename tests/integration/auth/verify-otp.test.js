/**
 * -----------------------------------------------------------------------------
 * File: verify-otp.test.js
 * Description: Integration Tests for Verify OTP Endpoint (POST /api/v1/auth/verify-otp)
 * -----------------------------------------------------------------------------
 */

import verifyOtpService from '../../../src/modules/auth/services/verify-otp.service.js';
import sendOtpService from '../../../src/modules/auth/services/send-otp.service.js';
import otpVerificationRepository from '../../../src/modules/auth/repositories/otp-verification.repository.js';

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

  it('should increment attemptCount when an invalid OTP is provided', async () => {
    const mobile = `9${Date.now().toString().slice(-9)}`;

    await sendOtpService.execute({
      mobile,
    });

    const initialOtp = await otpVerificationRepository.findLatestActiveOTP(mobile, 'LOGIN');

    expect(initialOtp).toBeTruthy();

    const initialAttemptCount = initialOtp.attemptCount;

    await expect(
      verifyOtpService.execute({
        mobile,

        otp: '000000',

        sessionPayload: {
          ipAddress: '127.0.0.1',

          userAgent: 'Jest Integration Test',

          loginMethod: 'PHONE_OTP',
        },
      })
    ).rejects.toThrow();

    const updatedOtp = await otpVerificationRepository.findLatestActiveOTP(mobile, 'LOGIN');

    expect(updatedOtp).toBeTruthy();

    expect(updatedOtp.attemptCount).toBe(initialAttemptCount + 1);
  });
});
