/**
 * -----------------------------------------------------------------------------
 * File: error-codes.js
 * Description:
 * Centralized Error Codes Registry for CricNova Backend.
 *
 * Purpose:
 * - Eliminate magic strings.
 * - Provide machine-readable error identifiers.
 * - Keep controllers/services consistent.
 * - Simplify frontend error handling.
 * - Improve logging and monitoring.
 *
 * Naming Convention:
 * DOMAIN_DESCRIPTION
 *
 * Example:
 * AUTH_INVALID_OTP
 * USER_NOT_FOUND
 * TEAM_ALREADY_EXISTS
 * -----------------------------------------------------------------------------
 */

const ErrorCodes = Object.freeze({
  /**
   * ---------------------------------------------------------------------------
   * Generic Errors
   * ---------------------------------------------------------------------------
   */
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',

  /**
   * ---------------------------------------------------------------------------
   * Authentication
   * ---------------------------------------------------------------------------
   */
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_ALREADY_VERIFIED: 'OTP_ALREADY_VERIFIED',
  OTP_ATTEMPTS_EXCEEDED: 'OTP_ATTEMPTS_EXCEEDED',

  INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN',
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',

  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',

  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  /**
   * ---------------------------------------------------------------------------
   * User
   * ---------------------------------------------------------------------------
   */
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_INACTIVE: 'USER_INACTIVE',

  /**
   * ---------------------------------------------------------------------------
   * Role & Permission
   * ---------------------------------------------------------------------------
   */
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  /**
   * ---------------------------------------------------------------------------
   * Database
   * ---------------------------------------------------------------------------
   */
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNIQUE_CONSTRAINT_FAILED: 'UNIQUE_CONSTRAINT_FAILED',
  FOREIGN_KEY_CONSTRAINT_FAILED: 'FOREIGN_KEY_CONSTRAINT_FAILED',

  /**
   * ---------------------------------------------------------------------------
   * File Upload
   * ---------------------------------------------------------------------------
   */
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',

  /**
   * ---------------------------------------------------------------------------
   * External Services
   * ---------------------------------------------------------------------------
   */
  SMS_SERVICE_UNAVAILABLE: 'SMS_SERVICE_UNAVAILABLE',
  WHATSAPP_SERVICE_UNAVAILABLE: 'WHATSAPP_SERVICE_UNAVAILABLE',
  REDIS_UNAVAILABLE: 'REDIS_UNAVAILABLE',
});

export default ErrorCodes;
