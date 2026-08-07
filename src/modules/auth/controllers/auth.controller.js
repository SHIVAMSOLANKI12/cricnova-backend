/**
 * -----------------------------------------------------------------------------
 * File: auth.controller.js
 * Description:
 * Enterprise Authentication Controller
 *
 * Responsibilities:
 * - Receive HTTP Requests
 * - Extract Request Payloads & Metadata
 * - Call Service Layer
 * - Manage Auth Cookie Lifecycles
 * - Return Standardized API Responses
 *
 * NOTE:
 * - No Business Logic
 * - No Database Queries
 * - No Direct JWT/Crypto Logic
 * -----------------------------------------------------------------------------
 */

import ApiResponse from '../../../common/response/api-response.js';
import asyncHandler from '../../../common/middleware/async-handler.js';

import CookieProvider from '../providers/cookie.provider.js';
import SessionProvider from '../providers/session.provider.js';

import sendOtpService from '../services/send-otp.service.js';
import verifyOtpService from '../services/verify-otp.service.js';
import refreshTokenService from '../services/refresh-token.service.js';
import logoutService from '../services/logout.service.js';
import logoutAllService from '../services/logout-all.service.js';
import getCurrentUserService from '../services/get-current-user.service.js';

class AuthController {
  /**
   * -------------------------------------------------------------------------
   * Request Session Metadata Payload Builder
   * -------------------------------------------------------------------------
   */
  buildSessionPayload(req) {
    return SessionProvider.build(req);
  }

  /**
   * -------------------------------------------------------------------------
   * POST /api/v1/auth/send-otp
   * -------------------------------------------------------------------------
   */
  sendOtp = asyncHandler(async (req, res) => {
    const result = await sendOtpService.execute({
      mobile: req.body.mobile,
    });

    return res.status(200).json(
      ApiResponse.success({
        message: 'OTP sent successfully.',
        data: result,
      })
    );
  });

  /**
   * -------------------------------------------------------------------------
   * POST /api/v1/auth/verify-otp
   * -------------------------------------------------------------------------
   */
  verifyOtp = asyncHandler(async (req, res) => {
    const sessionPayload = this.buildSessionPayload(req);

    const result = await verifyOtpService.execute({
      mobile: req.body.mobile,
      otp: req.body.otp,
      sessionPayload,
    });

    CookieProvider.setRefreshToken(res, result.refreshToken);

    return res.status(200).json(
      ApiResponse.success({
        message: 'Authentication successful.',
        data: {
          isNewUser: result.isNewUser,
          accessToken: result.accessToken,
          user: result.user,
          roles: result.roles,
        },
      })
    );
  });

  /**
   * -------------------------------------------------------------------------
   * POST /api/v1/auth/refresh-token
   * -------------------------------------------------------------------------
   */
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const result = await refreshTokenService.execute(refreshToken);

    CookieProvider.setRefreshToken(res, result.refreshToken);

    return res.status(200).json(
      ApiResponse.success({
        message: 'Access token refreshed successfully.',
        data: {
          accessToken: result.accessToken,
          roles: result.roles,
        },
      })
    );
  });

  /**
   * -------------------------------------------------------------------------
   * POST /api/v1/auth/logout
   * -------------------------------------------------------------------------
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const result = await logoutService.execute(refreshToken);

    CookieProvider.clearAuthCookies(res);

    return res.status(200).json(
      ApiResponse.success({
        message: result.message ?? 'Logged out successfully.',
      })
    );
  });

  /**
   * -------------------------------------------------------------------------
   * POST /api/v1/auth/logout-all
   * -------------------------------------------------------------------------
   */
  logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await logoutAllService.execute({ userId });

    CookieProvider.clearAuthCookies(res);

    return res.status(200).json(
      ApiResponse.success({
        message: result.message ?? 'Logged out from all devices successfully.',
      })
    );
  });

  /**
   * -------------------------------------------------------------------------
   * GET /api/v1/auth/me
   * -------------------------------------------------------------------------
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await getCurrentUserService.execute(userId);

    return res.status(200).json(
      ApiResponse.success({
        message: 'User profile fetched successfully.',
        data: result,
      })
    );
  });
}

export default new AuthController();
