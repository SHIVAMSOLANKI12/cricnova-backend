/**
 * -----------------------------------------------------------------------------
 * File: user.controller.js
 * Description:
 * Enterprise User Profile Controller
 *
 * Responsibilities:
 * - Handle HTTP requests for user profile APIs
 * - Extract authenticated user identity
 * - Delegate business logic to services
 * - Return standardized API responses
 *
 * NOTE:
 * - No Prisma
 * - No Repository
 * - No Business Logic
 * - No profile completion calculation
 * -----------------------------------------------------------------------------
 */

import asyncHandler from '../../../common/middleware/async-handler.js';
import ApiResponse from '../../../common/response/api-response.js';

import getProfileService from '../services/get-profile.service.js';
import updateProfileService from '../services/update-profile.service.js';

class UserController {
  /**
   * ---------------------------------------------------------------------------
   * Get Current User Profile
   * ---------------------------------------------------------------------------
   *
   * GET /api/v1/users/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const profile = await getProfileService.execute(userId);

    return res.status(200).json(ApiResponse.success('Profile fetched successfully.', profile));
  });

  /**
   * ---------------------------------------------------------------------------
   * Update Current User Profile
   * ---------------------------------------------------------------------------
   *
   * PATCH /api/v1/users/me/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const profile = await updateProfileService.execute({
      userId,
      data: req.body,
    });

    return res.status(200).json(ApiResponse.success('Profile updated successfully.', profile));
  });
}

export default new UserController();
