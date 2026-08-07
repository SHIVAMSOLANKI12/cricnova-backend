/**
 * -----------------------------------------------------------------------------
 * File: not-found.js
 * Description:
 * Handles requests for undefined routes.
 *
 * Purpose:
 * - Creates a standardized 404 error.
 * - Forwards the error to the Global Error Middleware.
 * - Prevents duplicate response logic.
 *
 * NOTE:
 * Always register this middleware AFTER all routes.
 * -----------------------------------------------------------------------------
 */

import AppError from '../errors/app-error.js';
import ErrorCodes from '../errors/error-codes.js';
import ErrorMessages from '../errors/error-messages.js';

const notFound = (req, res, next) => {
  return next(
    new AppError({
      message: ErrorMessages.RESOURCE_NOT_FOUND,
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      statusCode: 404,
      details: {
        method: req.method,
        path: req.originalUrl,
      },
    })
  );
};

export default notFound;
