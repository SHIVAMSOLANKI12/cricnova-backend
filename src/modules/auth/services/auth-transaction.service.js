/**
 * -----------------------------------------------------------------------------
 * File: auth-transaction.service.js
 *
 * Description:
 * Enterprise Authentication Transaction Service
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 * • Login Existing User
 * • Auto Register New User
 * • Assign Default PLAYER Role
 * • Create Login Session
 * • Generate Access Token
 * • Generate Refresh Token
 * • Persist Refresh Token
 * • Update Last Login
 * • Mark OTP Verified
 * • Atomic Database Transaction
 *
 * NOTE
 * -----------------------------------------------------------------------------
 * • No Express
 * • No Cookie
 * • No HTTP Response
 * • No Validation
 * -----------------------------------------------------------------------------
 */

import prisma from '../../../core/database/prisma.client.js';

import bootstrapUserService from './bootstrap-user.service.js';
import assignDefaultRoleService from './assign-default-role.service.js';

import TokenProvider from '../providers/token.provider.js';

import userRepository from '../repositories/user.repository.js';
import sessionRepository from '../repositories/session.repository.js';
import refreshTokenRepository from '../repositories/refresh-token.repository.js';
import otpVerificationRepository from '../repositories/otp-verification.repository.js';

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import { USER_STATUS, LOGIN_METHOD, AUTH_CONFIG } from '../constants/auth.constants.js';

const ALLOWED_LOGIN_STATUSES = Object.freeze([USER_STATUS.ACTIVE]);

class AuthTransactionService {
  /**
   * -------------------------------------------------------------------------
   * Find Existing User
   * -------------------------------------------------------------------------
   */
  async findExistingUser(mobile, tx) {
    return userRepository.findByMobile(mobile, tx);
  }

  /**
   * -------------------------------------------------------------------------
   * Bootstrap User
   * -------------------------------------------------------------------------
   */
  async bootstrapUser(mobile, tx) {
    const user = await bootstrapUserService.execute(
      {
        mobile,
      },
      tx
    );

    await assignDefaultRoleService.execute(user.id, tx);

    return user;
  }

  /**
   * -------------------------------------------------------------------------
   * Find Existing User
   * OR
   * Bootstrap New User
   * -------------------------------------------------------------------------
   */
  async resolveUser(mobile, tx) {
    let isNewUser = false;

    let user = await this.findExistingUser(mobile, tx);

    if (!user) {
      user = await this.bootstrapUser(mobile, tx);

      isNewUser = true;
    }

    return {
      user,

      isNewUser,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * Load User Roles
   * -------------------------------------------------------------------------
   */
  async loadRoles(userId, tx) {
    return userRepository.findActiveUserRoles(userId, tx);
  }

  /**
   * -------------------------------------------------------------------------
   * Build Session Payload
   * -------------------------------------------------------------------------
   */
  buildSessionData(userId, sessionPayload = {}) {
    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + AUTH_CONFIG.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    return {
      userId,

      ipAddress: sessionPayload.ipAddress,

      userAgent: sessionPayload.userAgent,

      loginMethod: sessionPayload.loginMethod ?? LOGIN_METHOD.PHONE_OTP,

      lastActivityAt: now,

      expiresAt,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * Create Session
   * -------------------------------------------------------------------------
   */
  async createSession(user, sessionPayload = {}, tx) {
    const sessionData = {
      userId: user.id,
      ...this.buildSessionData(user.id, sessionPayload),
    };

    return sessionRepository.create(sessionData, tx);
  }

  /**
   * -------------------------------------------------------------------------
   * Generate Token Pair
   * -------------------------------------------------------------------------
   */
  async generateTokenPair(user, session, tx) {
    const roles = await this.loadRoles(user.id, tx);

    const payload = {
      sub: user.id,

      sessionId: session.id,

      phone: user.phone,

      roles,

      status: user.status,
    };

    const tokenPair = TokenProvider.generateTokenPair(payload);

    return {
      ...tokenPair,

      roles,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * Persist Refresh Token
   * -------------------------------------------------------------------------
   */
  async persistRefreshToken(user, session, tokenPair, tx) {
    const refreshTokenExpiry = new Date(
      Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    const refreshToken = await refreshTokenRepository.create(
      {
        userId: user.id,

        sessionId: session.id,

        tokenHash: tokenPair.refreshTokenHash,

        expiresAt: refreshTokenExpiry,
      },
      tx
    );

    return refreshToken;
  }

  /**
   * -------------------------------------------------------------------------
   * Update User Last Login
   * -------------------------------------------------------------------------
   */
  async updateLastLogin(user, tx) {
    const lastLoginAt = new Date();

    await userRepository.updateLastLogin(user.id, lastLoginAt, tx);

    return lastLoginAt;
  }

  /**
   * -------------------------------------------------------------------------
   * Mark OTP As Verified
   * -------------------------------------------------------------------------
   */
  async markOTPVerified(otpRecord, tx) {
    if (!otpRecord?.id) {
      return null;
    }

    return otpVerificationRepository.markVerified(otpRecord.id, tx);
  }

  /**
   * -------------------------------------------------------------------------
   * Verify User Status
   * -------------------------------------------------------------------------
   */
  verifyUserStatus(user) {
    if (!user) {
      throw new AppError({
        message: ErrorMessages.USER_NOT_FOUND ?? 'User not found.',

        code: ErrorCodes.USER_NOT_FOUND ?? 'USER_NOT_FOUND',

        statusCode: 404,
      });
    }

    if (!ALLOWED_LOGIN_STATUSES.includes(user.status)) {
      throw new AppError({
        message: ErrorMessages.USER_INACTIVE ?? 'Your account is inactive or suspended.',

        code: ErrorCodes.USER_INACTIVE ?? 'USER_INACTIVE',

        statusCode: 403,
      });
    }
  }

  /**
   * -------------------------------------------------------------------------
   * Execute Authentication Transaction
   *
   * Part A
   * -------------------------------------------------------------------------
   */
  async execute({ mobile, otpRecord, sessionPayload = {} }) {
    return prisma.$transaction(async (tx) => {
      /**
       * -------------------------------------------------------------
       * Resolve User
       * -------------------------------------------------------------
       */

      const { user, isNewUser } = await this.resolveUser(mobile, tx);

      /**
       * -------------------------------------------------------------
       * Verify Account Status
       * -------------------------------------------------------------
       */

      this.verifyUserStatus(user);

      /**
       * -------------------------------------------------------------
       * Create Login Session
       * -------------------------------------------------------------
       */

      const session = await this.createSession(user, sessionPayload, tx);

      /**
       * -------------------------------------------------------------
       * Continue In Part B
       * -------------------------------------------------------------
       */

      /**
       * -------------------------------------------------------------
       * Generate Token Pair
       * -------------------------------------------------------------
       */

      const tokenPair = await this.generateTokenPair(user, session, tx);

      /**
       * -------------------------------------------------------------
       * Persist Refresh Token
       * -------------------------------------------------------------
       */

      await this.persistRefreshToken(user, session, tokenPair, tx);

      /**
       * -------------------------------------------------------------
       * Mark OTP As Verified
       * -------------------------------------------------------------
       */

      await this.markOTPVerified(otpRecord, tx);

      /**
       * -------------------------------------------------------------
       * Update Last Login
       * -------------------------------------------------------------
       */

      await this.updateLastLogin(user, tx);

      /**
       * -------------------------------------------------------------
       * Continue In Part C
       * -------------------------------------------------------------
       */

      /**
       * -------------------------------------------------------------
       * Build Safe User Response
       * -------------------------------------------------------------
       */

      const userResponse = {
        id: user.id,

        phone: user.phone,

        firstName: user.firstName,

        lastName: user.lastName,

        username: user.username,

        email: user.email,

        status: user.status,

        profileCompleted: user.profileCompleted,
      };

      /**
       * -------------------------------------------------------------
       * Build Safe Session Response
       * -------------------------------------------------------------
       */

      const sessionResponse = {
        id: session.id,

        loginMethod: session.loginMethod,

        expiresAt: session.expiresAt,
      };

      /**
       * -------------------------------------------------------------
       * Return Authentication Result
       * -------------------------------------------------------------
       */

      return {
        isNewUser,

        accessToken: tokenPair.accessToken,

        refreshToken: tokenPair.refreshToken,

        user: userResponse,

        roles: tokenPair.roles,

        session: sessionResponse,
      };
    });
  }
}

export default new AuthTransactionService();
