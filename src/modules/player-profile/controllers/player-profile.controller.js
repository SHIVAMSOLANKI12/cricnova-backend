/**
 * -----------------------------------------------------------------------------
 * File: player-profile.controller.js
 * Description:
 * Enterprise Cricket Player Profile Controller
 *
 * Responsibilities:
 * - Handle authenticated PlayerProfile HTTP requests
 * - Delegate business logic to PlayerProfileService
 * - Return standardized API responses
 * - Keep HTTP layer free from business/database logic
 * -----------------------------------------------------------------------------
 */

import asyncHandler from '../../../common/middleware/async-handler.js';
import ApiResponse from '../../../common/response/api-response.js';

import playerProfileService from '../services/player-profile.service.js';

class PlayerProfileController {
  /**
   * GET /api/v1/users/me/player-profile
   */
  getPlayerProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const profile = await playerProfileService.getMyPlayerProfile(userId);

    return res
      .status(200)
      .json(ApiResponse.success('Player profile fetched successfully.', profile));
  });

  /**
   * PATCH /api/v1/users/me/player-profile
   */
  updatePlayerProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const profile = await playerProfileService.updateMyPlayerProfile(userId, req.body);

    return res
      .status(200)
      .json(ApiResponse.success('Player profile updated successfully.', profile));
  });
}

export default new PlayerProfileController();
