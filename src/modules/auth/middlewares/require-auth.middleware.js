/**
 * -----------------------------------------------------------------------------
 * File: require-auth.middleware.js
 * Description:
 * Enterprise Authentication Middleware
 *
 * Responsibilities:
 * - Validate Bearer Access Token
 * - Verify JWT Payload
 * - Load Active User
 * - Verify User Account Status
 * - Verify Active Session
 * - Attach Authenticated User & Context to Request
 *
 * NOTE:
 * - No business logic
 * - No role permission enforcement
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import { USER_STATUS } from '../constants/auth.constants.js';
import JwtProvider from '../providers/jwt.provider.js';
import userRepository from '../repositories/user.repository.js';
import sessionRepository from '../repositories/session.repository.js';

export default async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AppError({
        message: ErrorMessages.UNAUTHORIZED,

        code: ErrorCodes.UNAUTHORIZED,

        statusCode: 401,
      });
    }

    const accessToken = authorization.substring(7);

    const payload = JwtProvider.verifyAccessToken(accessToken);

    const user = await userRepository.findActiveUserById(payload.sub);

    if (!user) {
      throw new AppError({
        message: ErrorMessages.USER_NOT_FOUND,

        code: ErrorCodes.USER_NOT_FOUND,

        statusCode: 401,
      });
    }

    /**
     * -------------------------------------------------------------
     * 1. User Status Check
     * -------------------------------------------------------------
     */
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError({
        message: ErrorMessages.USER_INACTIVE ?? 'Account is inactive or suspended.',

        code: ErrorCodes.USER_INACTIVE ?? 'USER_INACTIVE',

        statusCode: 401,
      });
    }

    /**
     * -------------------------------------------------------------
     * 2. Session Validation
     * -------------------------------------------------------------
     */
    if (payload.sessionId) {
      const session = await sessionRepository.findActiveById(payload.sessionId);

      if (!session) {
        throw new AppError({
          message: ErrorMessages.SESSION_EXPIRED ?? 'Session has been revoked or expired.',

          code: ErrorCodes.SESSION_EXPIRED ?? 'SESSION_EXPIRED',

          statusCode: 401,
        });
      }
    }

    /**
     * -------------------------------------------------------------
     * 3. Request Context Attachment
     * -------------------------------------------------------------
     */
    req.user = {
      id: user.id,

      phone: user.phone,

      roles: payload.roles ?? [],

      sessionId: payload.sessionId,
    };

    req.auth = {
      token: accessToken,

      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
