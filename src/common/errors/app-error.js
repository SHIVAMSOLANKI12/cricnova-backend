/**
 * -----------------------------------------------------------------------------
 * File: app-error.js
 * Description:
 * Enterprise Custom Error Class for CricNova Backend.
 *
 * Purpose:
 * - Standardize all application errors.
 * - Preserve HTTP status codes.
 * - Attach machine-readable error codes.
 * - Support operational vs programming errors.
 * - Capture additional debugging details.
 *
 * NOTE:
 * Never throw native Error directly inside business logic.
 * Always throw AppError.
 * -----------------------------------------------------------------------------
 */

class AppError extends Error {
  /**
   * @param {Object} options
   * @param {string} options.message - Human readable error message.
   * @param {string} options.code - Machine readable error code.
   * @param {number} options.statusCode - HTTP status code.
   * @param {boolean} options.isOperational - Operational error?
   * @param {Object|null} options.details - Additional validation/debug info.
   */
  constructor({
    message,
    code = 'INTERNAL_SERVER_ERROR',
    statusCode = 500,
    isOperational = true,
    details = null,
  }) {
    super(message);

    this.name = this.constructor.name;

    this.code = code;

    this.statusCode = statusCode;

    this.isOperational = isOperational;

    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
