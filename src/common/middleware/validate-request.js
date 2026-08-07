// Validate Request Middleware
/**
 * -----------------------------------------------------------------------------
 * File: validate-request.js
 * Description:
 * Generic Zod Validation Middleware
 *
 * Responsibilities:
 * - Validate req.body
 * - Validate req.params
 * - Validate req.query
 * - Replace request with sanitized values
 * - Forward validation errors to Global Error Middleware
 * -----------------------------------------------------------------------------
 */

import AppError from '../errors/app-error.js';
import ErrorCodes from '../errors/error-codes.js';
import ErrorMessages from '../errors/error-messages.js';

/**
 * Creates a reusable validation middleware.
 *
 * @param {Object} schema
 * @param {ZodSchema} schema.body
 * @param {ZodSchema} schema.params
 * @param {ZodSchema} schema.query
 */
const validateRequest =
  ({ body, params, query } = {}) =>
  async (req, res, next) => {
    try {
      if (body) {
        req.body = await body.parseAsync(req.body);
      }

      if (params) {
        req.params = await params.parseAsync(req.params);
      }

      if (query) {
        req.query = await query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      next(
        new AppError({
          message: ErrorMessages.VALIDATION_ERROR,
          code: ErrorCodes.VALIDATION_ERROR,
          statusCode: 422,
          details: error.issues ?? null,
        })
      );
    }
  };

export default validateRequest;
