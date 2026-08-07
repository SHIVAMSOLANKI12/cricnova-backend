/**
 * -----------------------------------------------------------------------------
 * File: auth.routes.js
 * Description:
 * Enterprise Authentication Routes (Mounted under /api/v1/auth)
 *
 * Responsibilities:
 * - Register authentication endpoints
 * - Apply validation middleware
 * - Apply authentication middleware
 * - Expose health check & OAuth placeholders
 * - Delegate to controller
 *
 * NOTE:
 * No business logic.
 * -----------------------------------------------------------------------------
 */

import { Router } from 'express';

import authController from '../controllers/auth.controller.js';

import requireAuth from '../middlewares/require-auth.middleware.js';

import validate from '../../../common/middleware/validate-request.js';

import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validations/auth.validation.js';

import AppError from '../../../common/errors/app-error.js';

const router = Router();

/**
 * -------------------------------------------------------------------------
 * Health Check Endpoint
 * @route   GET /api/v1/auth/health
 * -------------------------------------------------------------------------
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    module: 'auth',
    timestamp: new Date().toISOString(),
  });
});

/**
 * -------------------------------------------------------------------------
 * Public Routes
 * -------------------------------------------------------------------------
 */

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to mobile number
 * @access  Public
 */
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and authenticate user
 * @access  Public
 */
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Rotate and issue new access & refresh tokens
 * @access  Public
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

/**
 * -------------------------------------------------------------------------
 * Protected Routes
 * -------------------------------------------------------------------------
 */

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke current refresh token and session
 * @access  Protected
 */
router.post('/logout', requireAuth, validate(logoutSchema), authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Revoke all active user sessions & tokens across all devices
 * @access  Protected
 */
router.post('/logout-all', requireAuth, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Fetch authenticated user profile
 * @access  Protected
 */
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * -------------------------------------------------------------------------
 * OAuth Placeholder Routes (Future Extension)
 * -------------------------------------------------------------------------
 */
router.get('/google', (req, res, next) =>
  next(new AppError({ message: 'Google OAuth not implemented yet.', statusCode: 501 }))
);
router.get('/google/callback', (req, res, next) =>
  next(new AppError({ message: 'Google OAuth callback not implemented yet.', statusCode: 501 }))
);
router.get('/apple', (req, res, next) =>
  next(new AppError({ message: 'Apple OAuth not implemented yet.', statusCode: 501 }))
);
router.get('/apple/callback', (req, res, next) =>
  next(new AppError({ message: 'Apple OAuth callback not implemented yet.', statusCode: 501 }))
);

export default router;
