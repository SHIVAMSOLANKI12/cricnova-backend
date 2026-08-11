/**
 * -----------------------------------------------------------------------------
 * File: user.routes.js
 * Description:
 * Enterprise User Profile Routes
 *
 * Responsibilities:
 * - Register authenticated user profile endpoints
 * - Apply authentication middleware
 * - Apply request validation
 * - Delegate requests to UserController
 *
 * NOTE:
 * - No business logic
 * - No Prisma
 * - No repository access
 * - No service calls directly
 * -----------------------------------------------------------------------------
 */

import { Router } from 'express';

import userController from '../controllers/user.controller.js';

import requireAuth from '../../auth/middlewares/require-auth.middleware.js';

import validate from '../../../common/middleware/validate-request.js';

import { updateProfileSchema } from '../validations/user-profile.validation.js';
import updateAvatarSchema from '../validations/avatar.validation.js';
import { profilePhotoUpload } from '../../../common/middleware/upload.middleware.js';

const router = Router();

/**
 * -----------------------------------------------------------------------------
 * Current Authenticated User
 * -----------------------------------------------------------------------------
 *
 * GET /api/v1/users/me
 *
 * Authentication:
 * - Required
 */
router.get('/me', requireAuth, userController.getProfile);

/**
 * -----------------------------------------------------------------------------
 * Update Authenticated User Profile
 * -----------------------------------------------------------------------------
 *
 * PATCH /api/v1/users/me/profile
 *
 * Authentication:
 * - Required
 *
 * Validation:
 * - updateProfileSchema
 */
router.patch(
  '/me/profile',
  requireAuth,
  validate(updateProfileSchema),
  userController.updateProfile
);

/**
 * -----------------------------------------------------------------------------
 * Avatar Update Route
 * -----------------------------------------------------------------------------
 *
 * PATCH /api/v1/users/me/avatar
 *
 * Flow:
 * requireAuth
 *      ↓
 * Zod validation
 *      ↓
 * UserController.updateAvatar
 *
 * NOTE:
 * - Authentication is mandatory.
 * - Validation happens before controller execution.
 * - Controller contains no business logic.
 * -----------------------------------------------------------------------------
 */

router.patch('/me/avatar', requireAuth, validate(updateAvatarSchema), userController.updateAvatar);

/**
 * -----------------------------------------------------------------------------
 * Update Profile Photo
 * -----------------------------------------------------------------------------
 *
 * PUT /api/v1/users/me/photo
 *
 * Supports:
 * - Gallery image
 * - Camera / selfie image
 *
 * Unified multipart upload contract.
 */
router.put('/me/photo', requireAuth, profilePhotoUpload, userController.updatePhoto);

export default router;
