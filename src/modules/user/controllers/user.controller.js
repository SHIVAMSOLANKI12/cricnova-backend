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
import updateAvatarService from '../services/update-avatar.service.js';
import updatePhotoService from '../services/update-photo.service.js';

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

  /**
   * ---------------------------------------------------------------------------
   * Update User Avatar
   * ---------------------------------------------------------------------------
   *
   * PATCH /api/v1/users/me/avatar
   */
  updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { avatarId } = req.body;

    const user = await updateAvatarService.execute({
      userId,
      avatarId,
    });

    return res.status(200).json(ApiResponse.success('Avatar updated successfully.', user));
  });

  /**
   * ---------------------------------------------------------------------------
   * Update Profile Photo
   * ---------------------------------------------------------------------------
   *
   * PUT /api/v1/users/me/photo
   */
  updatePhoto = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const user = await updatePhotoService.execute({
      userId,
      file: req.file,
    });

    return res.status(200).json(ApiResponse.success('Profile photo updated successfully.', user));
  });
}

export default new UserController();
