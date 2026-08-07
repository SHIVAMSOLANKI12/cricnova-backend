/**
 * -----------------------------------------------------------------------------
 * File: error-messages.js
 * Description:
 * Centralized Error Messages Registry for CricNova Backend.
 *
 * Purpose:
 * - Store all user-facing error messages in one place.
 * - Eliminate hardcoded messages across the project.
 * - Prepare the project for future localization (i18n).
 * - Keep API responses consistent.
 *
 * NOTE:
 * These messages are safe to expose to API consumers.
 * Never expose stack traces, SQL errors, Prisma errors,
 * or internal implementation details.
 * -----------------------------------------------------------------------------
 */

const ErrorMessages = Object.freeze({
  /**
   * ---------------------------------------------------------------------------
   * Generic
   * ---------------------------------------------------------------------------
   */
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',

  VALIDATION_ERROR: 'Validation failed. Please check your input.',

  BAD_REQUEST: 'The request is invalid.',

  RESOURCE_NOT_FOUND: 'The requested resource could not be found.',

  METHOD_NOT_ALLOWED: 'This request method is not allowed.',

  CONFLICT: 'The requested operation could not be completed.',

  /**
   * ---------------------------------------------------------------------------
   * Authentication
   * ---------------------------------------------------------------------------
   */
  UNAUTHORIZED: 'You are not authorized to perform this action.',

  INVALID_CREDENTIALS: 'Invalid credentials.',

  INVALID_OTP: 'The OTP you entered is invalid.',

  OTP_EXPIRED: 'The OTP has expired. Please request a new one.',

  OTP_ALREADY_VERIFIED: 'This OTP has already been verified.',

  OTP_ATTEMPTS_EXCEEDED: 'Maximum OTP verification attempts exceeded.',

  INVALID_ACCESS_TOKEN: 'Invalid access token.',

  ACCESS_TOKEN_EXPIRED: 'Your session has expired. Please login again.',

  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',

  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired. Please login again.',

  ACCOUNT_LOCKED: 'Your account has been temporarily locked.',

  /**
   * ---------------------------------------------------------------------------
   * User
   * ---------------------------------------------------------------------------
   */
  USER_NOT_FOUND: 'User not found.',

  USER_ALREADY_EXISTS: 'User already exists.',

  USER_INACTIVE: 'Your account is inactive. Please contact support.',

  /**
   * ---------------------------------------------------------------------------
   * Role & Permission
   * ---------------------------------------------------------------------------
   */
  ROLE_NOT_FOUND: 'Role not found.',

  PERMISSION_DENIED: 'You do not have permission to perform this action.',

  /**
   * ---------------------------------------------------------------------------
   * Database
   * ---------------------------------------------------------------------------
   */
  DATABASE_ERROR: 'Database operation failed.',

  UNIQUE_CONSTRAINT_FAILED: 'The provided data already exists.',

  FOREIGN_KEY_CONSTRAINT_FAILED: 'Related resource not found.',

  /**
   * ---------------------------------------------------------------------------
   * File Upload
   * ---------------------------------------------------------------------------
   */
  FILE_UPLOAD_FAILED: 'Unable to upload the file.',

  INVALID_FILE_TYPE: 'Unsupported file type.',

  /**
   * ---------------------------------------------------------------------------
   * External Services
   * ---------------------------------------------------------------------------
   */
  SMS_SERVICE_UNAVAILABLE: 'SMS service is currently unavailable.',

  WHATSAPP_SERVICE_UNAVAILABLE: 'WhatsApp service is currently unavailable.',

  REDIS_UNAVAILABLE: 'Caching service is currently unavailable.',
});

export default ErrorMessages;
