/**
 * -----------------------------------------------------------------------------
 * File: auth.constants.js
 * Description:
 * Enterprise Authentication Constants
 *
 * Responsibilities:
 * - Authentication constants
 * - OTP constants
 * - Session constants
 * - User status constants
 * - Role constants
 * - Token constants
 *
 * NOTE:
 * Single source of truth for Auth module.
 * -----------------------------------------------------------------------------
 */

/**
 * --------------------------------------------------------------------------
 * User Status
 * --------------------------------------------------------------------------
 */
export const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
});

/**
 * --------------------------------------------------------------------------
 * Roles
 * --------------------------------------------------------------------------
 */
export const ROLE = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  HR: 'HR',
  PLAYER: 'PLAYER',
  CAPTAIN: 'CAPTAIN',
  SCORER: 'SCORER',
  UMPIRE: 'UMPIRE',
});

/**
 * --------------------------------------------------------------------------
 * OTP Purpose
 * --------------------------------------------------------------------------
 */
export const OTP_PURPOSE = Object.freeze({
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  CHANGE_PHONE: 'CHANGE_PHONE',
});

/**
 * --------------------------------------------------------------------------
 * OTP Target
 * --------------------------------------------------------------------------
 */
export const OTP_TARGET = Object.freeze({
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
});

/**
 * --------------------------------------------------------------------------
 * Login Method
 * --------------------------------------------------------------------------
 */
export const LOGIN_METHOD = Object.freeze({
  PHONE_OTP: 'PHONE_OTP',
  WHATSAPP_OTP: 'WHATSAPP_OTP',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  GOOGLE_OAUTH: 'GOOGLE_OAUTH',
  APPLE_OAUTH: 'APPLE_OAUTH',
});

/**
 * --------------------------------------------------------------------------
 * Session Status
 * --------------------------------------------------------------------------
 */
export const SESSION_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
});

/**
 * --------------------------------------------------------------------------
 * Token Type
 * --------------------------------------------------------------------------
 */
export const TOKEN_TYPE = Object.freeze({
  ACCESS: 'ACCESS',
  REFRESH: 'REFRESH',
});

/**
 * --------------------------------------------------------------------------
 * Cookie Names
 * --------------------------------------------------------------------------
 */
export const COOKIE_NAME = Object.freeze({
  REFRESH_TOKEN: 'refresh_token',
});

/**
 * --------------------------------------------------------------------------
 * Authentication Configuration
 * --------------------------------------------------------------------------
 */
export const AUTH_CONFIG = Object.freeze({
  OTP_LENGTH: 6,

  OTP_MAX_ATTEMPTS: 5,

  OTP_EXPIRY_MINUTES: 5,

  SESSION_EXPIRY_DAYS: 7,

  REFRESH_TOKEN_EXPIRY_DAYS: 30,
});
