/**
 * -----------------------------------------------------------------------------
 * File: require-role.middleware.js
 * Description:
 * Enterprise Role-Based Authorization Middleware
 *
 * Responsibilities:
 * - Validate authenticated user context
 * - Validate required roles (Case-Insensitive)
 * - Support Permission Contract
 * - Deny unauthorized access
 *
 * NOTE:
 * - Must be used after require-auth.middleware.js
 * - No database queries
 * - No business logic
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

export default function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError({
          message: ErrorMessages.UNAUTHORIZED,

          code: ErrorCodes.UNAUTHORIZED,

          statusCode: 401,
        });
      }

      /**
       * -------------------------------------------------------------
       * Permission Ready Contract
       * -------------------------------------------------------------
       */
      req.user.permissions = req.user.permissions ?? [];

      /**
       * -------------------------------------------------------------
       * Case-Insensitive Role Matching
       * -------------------------------------------------------------
       */
      const userRoles = req.user.roles ?? [];

      const normalizedUserRoles = userRoles.map((role) => String(role).toUpperCase());

      const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

      const authorized = normalizedAllowedRoles.some((role) => normalizedUserRoles.includes(role));

      if (!authorized) {
        throw new AppError({
          message: ErrorMessages.FORBIDDEN ?? 'You are not authorized to perform this action.',

          code: ErrorCodes.FORBIDDEN ?? 'FORBIDDEN',

          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
