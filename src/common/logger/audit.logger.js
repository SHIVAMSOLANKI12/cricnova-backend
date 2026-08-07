/**
 * -----------------------------------------------------------------------------
 * File: audit.logger.js
 * Description:
 * Enterprise Security Audit Logger
 *
 * Responsibilities:
 * - Log Security & Authentication Events
 * - Enforce PII & Secrets Sanitization (No OTP, Tokens, Passwords)
 * - Provide Structured Audit Logs
 * -----------------------------------------------------------------------------
 */

import logger from './winston.js';

export const AUDIT_EVENT = {
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  LOGOUT: 'LOGOUT',
  LOGOUT_ALL: 'LOGOUT_ALL',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
};

/**
 * Audit Logger Helper
 */
export function logAuditEvent({
  event,
  userId = null,
  sessionId = null,
  ipAddress = null,
  userAgent = null,
  status = 'SUCCESS',
  details = {},
}) {
  // Sanitize details to never leak sensitive credentials/tokens
  const sanitizedDetails = { ...details };

  delete sanitizedDetails.otp;
  delete sanitizedDetails.accessToken;
  delete sanitizedDetails.refreshToken;
  delete sanitizedDetails.password;
  delete sanitizedDetails.passwordHash;

  logger.info({
    type: 'SECURITY_AUDIT',
    event,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    status,
    details: sanitizedDetails,
    timestamp: new Date().toISOString(),
  });
}

export default logAuditEvent;
