/**
 * -----------------------------------------------------------------------------
 * File: avatar.validation.js
 * Description:
 * Enterprise User Avatar Validation
 *
 * Responsibilities:
 * - Validate avatar selection payload
 * - Ensure avatarId is a valid supported avatar
 * - Reject inactive/unknown avatars
 * - Prevent unexpected request fields
 *
 * NOTE:
 * - No database logic
 * - No repository access
 * - No business workflow
 * - Avatar catalog is the source of truth
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';

import { ACTIVE_AVATAR_IDS } from '../constants/avatar.constants.js';

/**
 * -----------------------------------------------------------------------------
 * Avatar ID Schema
 * -----------------------------------------------------------------------------
 *
 * Only currently active avatars are accepted.
 */
const avatarIdSchema = z
  .string({
    required_error: 'Avatar ID is required.',
    invalid_type_error: 'Avatar ID must be a string.',
  })
  .trim()
  .min(1, 'Avatar ID is required.')
  .max(100, 'Avatar ID is too long.')
  .refine((avatarId) => ACTIVE_AVATAR_IDS.includes(avatarId), {
    message: 'Selected avatar is not available.',
  });

/**
 * -----------------------------------------------------------------------------
 * Update Avatar Schema
 * -----------------------------------------------------------------------------
 *
 * PATCH /api/v1/users/me/avatar
 *
 * Only avatarId is allowed.
 */
export const updateAvatarSchema = z
  .object({
    avatarId: avatarIdSchema,
  })
  .strict();

/**
 * -----------------------------------------------------------------------------
 * Exported Types / Contract Helpers
 * -----------------------------------------------------------------------------
 *
 * Keeping parsing centralized prevents controllers/services from duplicating
 * validation rules.
 */
export function validateAvatarPayload(payload) {
  return updateAvatarSchema.parse(payload);
}

export default updateAvatarSchema;
