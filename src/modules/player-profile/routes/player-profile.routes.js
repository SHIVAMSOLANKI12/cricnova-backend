/**
 * -----------------------------------------------------------------------------
 * File: player-profile.routes.js
 * Description:
 * Enterprise Cricket Player Profile Routes
 *
 * Responsibilities:
 * - Register authenticated PlayerProfile endpoints
 * - Apply authentication middleware
 * - Apply request validation
 * - Delegate requests to PlayerProfileController
 * -----------------------------------------------------------------------------
 */

import { Router } from 'express';

import playerProfileController from '../controllers/player-profile.controller.js';

import requireAuth from '../../auth/middlewares/require-auth.middleware.js';

import validate from '../../../common/middleware/validate-request.js';

import { updatePlayerProfileSchema } from '../validations/player-profile.validation.js';

const router = Router();

/**
 * GET /api/v1/users/me/player-profile
 *
 * Fetch authenticated user's PlayerProfile.
 */
router.get('/me/player-profile', requireAuth, playerProfileController.getPlayerProfile);

/**
 * PATCH /api/v1/users/me/player-profile
 *
 * Create or partially update authenticated user's PlayerProfile.
 */
router.patch(
  '/me/player-profile',
  requireAuth,
  validate({
    body: updatePlayerProfileSchema,
  }),
  playerProfileController.updatePlayerProfile
);

export default router;
