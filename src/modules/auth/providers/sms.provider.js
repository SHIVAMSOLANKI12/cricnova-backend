/**
 * -----------------------------------------------------------------------------
 * File: sms.provider.js
 * Description:
 * SMS Provider Interface
 *
 * Responsibilities:
 * - Provide a single interface for sending SMS.
 * - Hide underlying SMS vendor implementation.
 * - Allow provider switching without changing business logic.
 *
 * NOTE:
 * AuthService should NEVER call MSG91/Twilio directly.
 * Always use this provider.
 * -----------------------------------------------------------------------------
 */

import logger from '../../../common/logger/winston.js';
import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

class SMSProvider {
  /**
   * Send OTP SMS
   *
   * @param {Object} payload
   * @param {string} payload.mobile
   * @param {string} payload.message
   */
  static async sendOTP({ mobile, message }) {
    try {
      /**
       * -----------------------------------------------------------------------
       * Temporary Development Mode
       *
       * Replace this block with actual provider implementation
       * (MSG91 / Twilio / Firebase / TextLocal)
       * -----------------------------------------------------------------------
       */

      logger.info('OTP SMS generated.', {
        mobile,
        provider: 'development',
      });

      // After (Development me OTP message terminal par dikhane ke liye):
      logger.info(`OTP SMS Generated for ${mobile}: ${message}`);

      return {
        success: true,
        provider: 'development',
      };
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.SMS_SERVICE_UNAVAILABLE,
        code: ErrorCodes.SMS_SERVICE_UNAVAILABLE,
        statusCode: 503,
      });
    }
  }
}

export default SMSProvider;
