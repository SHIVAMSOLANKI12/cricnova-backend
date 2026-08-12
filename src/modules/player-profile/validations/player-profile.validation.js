/**
 * -----------------------------------------------------------------------------
 * File: player-profile.validation.js
 * Description:
 * Enterprise Cricket Player Profile Zod Validation
 *
 * Responsibilities:
 * - Validate player profile PATCH payload
 * - Validate Enums (PlayingRole, BattingStyle, BowlingStyle)
 * - Reject unknown fields using strict mode
 * - Reject empty update objects
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';

/**
 * Enums
 */
const playingRoleEnum = z.enum(['BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER']);

const battingStyleEnum = z.enum(['RIGHT_HAND', 'LEFT_HAND']);

const bowlingStyleEnum = z.enum([
  'RIGHT_ARM_FAST',
  'LEFT_ARM_FAST',
  'RIGHT_ARM_MEDIUM',
  'LEFT_ARM_MEDIUM',
  'RIGHT_ARM_OFF_SPIN',
  'LEFT_ARM_ORTHODOX',
  'RIGHT_ARM_LEG_SPIN',
  'LEFT_ARM_CHINAMAN',
  'NONE',
]);

/**
 * Player Profile Update Schema
 */
export const updatePlayerProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name cannot be empty.')
      .max(100, 'Display name must not exceed 100 characters.')
      .optional(),

    playingRole: playingRoleEnum.optional(),

    battingStyle: battingStyleEnum.optional(),

    bowlingStyle: bowlingStyleEnum.optional(),

    bio: z.string().trim().max(500, 'Bio must not exceed 500 characters.').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export default {
  updatePlayerProfileSchema,
};
