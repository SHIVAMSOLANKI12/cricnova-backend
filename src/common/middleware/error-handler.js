/**
 * -----------------------------------------------------------------------------
 * File: error-handler.js
 * Description:
 * Global Error Handling Middleware.
 *
 * Responsibilities:
 * - Handle AppError instances.
 * - Handle Prisma errors.
 * - Handle Zod validation errors.
 * - Handle JWT errors.
 * - Hide sensitive information in production.
 * - Produce consistent API error responses.
 * -----------------------------------------------------------------------------
 */

import { ZodError } from 'zod';

import AppError from '../errors/app-error.js';
import ErrorCodes from '../errors/error-codes.js';
import ErrorMessages from '../errors/error-messages.js';

import env from '../../config/env.js';

const isProduction = env.NODE_ENV === 'production';

const errorHandler = (err, req, res, _next) => {
  let error = err;

  /**
   * ---------------------------------------------------------------------------
   * Unknown Error
   * ---------------------------------------------------------------------------
   */
  if (!(error instanceof AppError)) {
    /**
     * Zod Validation
     */
    if (error instanceof ZodError) {
      error = new AppError({
        message: ErrorMessages.VALIDATION_ERROR,
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 422,
        details: error.issues,
      });
    }

    /**
     * JWT Errors
     */
    else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = new AppError({
        message: ErrorMessages.INVALID_ACCESS_TOKEN,
        code: ErrorCodes.INVALID_ACCESS_TOKEN,
        statusCode: 401,
      });
    }

    /**
     * Prisma Unique Constraint
     */
    else if (error.code === 'P2002') {
      error = new AppError({
        message: ErrorMessages.UNIQUE_CONSTRAINT_FAILED,
        code: ErrorCodes.UNIQUE_CONSTRAINT_FAILED,
        statusCode: 409,
        details: error.meta,
      });
    }

    /**
     * Prisma Foreign Key
     */
    else if (error.code === 'P2003') {
      error = new AppError({
        message: ErrorMessages.FOREIGN_KEY_CONSTRAINT_FAILED,
        code: ErrorCodes.FOREIGN_KEY_CONSTRAINT_FAILED,
        statusCode: 400,
        details: error.meta,
      });
    }

    /**
     * Generic Internal Error
     */
    else {
      error = new AppError({
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        statusCode: 500,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Future Logger Hook
   * ---------------------------------------------------------------------------
   *
   * Example:
   *
   * logger.error({
   *   method: req.method,
   *   url: req.originalUrl,
   *   message: err.message,
   *   stack: err.stack,
   *   code: error.code
   * });
   *
   */

  return res.status(error.statusCode).json({
    success: false,

    message: error.message,

    error: {
      code: error.code,

      details: error.details ?? null,
    },

    ...(isProduction
      ? {}
      : {
          stack: err.stack,
        }),
  });
};

export default errorHandler;
