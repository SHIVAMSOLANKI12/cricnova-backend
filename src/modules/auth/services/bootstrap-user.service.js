/**
 * -----------------------------------------------------------------------------
 * File: bootstrap-user.service.js
 * Description:
 * Enterprise Bootstrap User Service
 *
 * Responsibilities
 * - Create new user
 * - Generate collision-safe username
 * - Mark phone verified
 * - Transaction aware
 * - Repository pattern only
 *
 * NOTE
 * - No Express
 * - No JWT
 * - No Session
 * - No Role Assignment
 * -----------------------------------------------------------------------------
 */

import crypto from 'crypto';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import userRepository from '../repositories/user.repository.js';

class BootstrapUserService {
  static MAX_USERNAME_ATTEMPTS = 5;

  /**
   * -------------------------------------------------------------------------
   * Generate Random Username
   * -------------------------------------------------------------------------
   */
  generateUsername() {
    return `cn_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * -------------------------------------------------------------------------
   * Generate Unique Username
   * -------------------------------------------------------------------------
   */
  async generateUniqueUsername(tx) {
    for (let attempt = 1; attempt <= BootstrapUserService.MAX_USERNAME_ATTEMPTS; attempt++) {
      const username = this.generateUsername();

      const exists = await userRepository.existsByUsername(username, tx);

      if (!exists) {
        return username;
      }
    }

    throw new AppError({
      message: ErrorMessages.USERNAME_GENERATION_FAILED ?? 'Unable to generate unique username.',

      code: ErrorCodes.USERNAME_GENERATION_FAILED ?? 'USERNAME_GENERATION_FAILED',

      statusCode: 500,
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Bootstrap User
   * -------------------------------------------------------------------------
   */
  async execute({ mobile, firstName = 'CricNova User', lastName = null, email = null }, tx) {
    const username = await this.generateUniqueUsername(tx);

    const safeFirstName = firstName || 'CricNova User';

    const user = await userRepository.create(
      {
        mobile,

        username,

        firstName: safeFirstName,

        lastName,

        email,

        phoneVerified: true,

        emailVerified: false,

        status: 'ACTIVE',
      },
      tx
    );

    return user;
  }
}

export default new BootstrapUserService();
