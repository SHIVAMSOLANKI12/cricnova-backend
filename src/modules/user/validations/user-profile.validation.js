/**
 * -----------------------------------------------------------------------------
 * File: user-profile.validation.js
 * Description:
 * Enterprise User Profile Validation
 *
 * Responsibilities:
 * - Validate partial profile updates
 * - Validate onboarding fields
 * - Normalize user input
 * - Prevent unauthorized profile fields
 *
 * NOTE:
 * - Pure Zod validation
 * - No Prisma
 * - No Express
 * - profileCompleted is SERVER CONTROLLED
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';

/**
 * -----------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------
 */

const MAX_NAME_LENGTH = 100;
const MAX_CITY_LENGTH = 100;
const MAX_AVATAR_ID_LENGTH = 100;
const MAX_LANGUAGE_LENGTH = 20;

/**
 * -----------------------------------------------------------------------------
 * Reusable Name Schema
 * -----------------------------------------------------------------------------
 */

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name cannot be empty.')
  .max(MAX_NAME_LENGTH, `Name must not exceed ${MAX_NAME_LENGTH} characters.`)
  .regex(/^[\p{L}\p{M}.'-]+(?:\s+[\p{L}\p{M}.'-]+)*$/u, 'Name contains invalid characters.');

/**
 * -----------------------------------------------------------------------------
 * Last Name Schema
 * -----------------------------------------------------------------------------
 */

const lastNameSchema = z
  .string()
  .trim()
  .max(MAX_NAME_LENGTH, `Last name must not exceed ${MAX_NAME_LENGTH} characters.`)
  .regex(/^[\p{L}\p{M}.'-]+(?:\s+[\p{L}\p{M}.'-]+)*$/u, 'Last name contains invalid characters.');

/**
 * -----------------------------------------------------------------------------
 * City Schema
 * -----------------------------------------------------------------------------
 */

const citySchema = z
  .string()
  .trim()
  .min(1, 'City cannot be empty.')
  .max(MAX_CITY_LENGTH, `City must not exceed ${MAX_CITY_LENGTH} characters.`)
  .regex(
    /^[\p{L}\p{M}0-9.'()&/-]+(?:\s+[\p{L}\p{M}0-9.'()&/-]+)*$/u,
    'City contains invalid characters.'
  );

/**
 * -----------------------------------------------------------------------------
 * Gender Schema
 * -----------------------------------------------------------------------------
 */

const genderSchema = z.enum(['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY']);

/**
 * -----------------------------------------------------------------------------
 * Profile Image URL Schema
 * -----------------------------------------------------------------------------
 */

const profileImageUrlSchema = z
  .string()
  .trim()
  .url('Invalid profile image URL.')
  .max(2048, 'Profile image URL is too long.');

/**
 * -----------------------------------------------------------------------------
 * Avatar ID Schema
 * -----------------------------------------------------------------------------
 */

const avatarIdSchema = z
  .string()
  .trim()
  .min(1, 'Avatar ID cannot be empty.')
  .max(MAX_AVATAR_ID_LENGTH, `Avatar ID must not exceed ${MAX_AVATAR_ID_LENGTH} characters.`)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Avatar ID contains invalid characters.');

/**
 * -----------------------------------------------------------------------------
 * Date of Birth Schema
 * -----------------------------------------------------------------------------
 */

const dateOfBirthSchema = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), 'Invalid date of birth.')
  .refine((date) => date <= new Date(), 'Date of birth cannot be in the future.')
  .refine((date) => {
    const today = new Date();

    let age = today.getFullYear() - date.getFullYear();

    const monthDifference = today.getMonth() - date.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age <= 120;
  }, 'Invalid date of birth.');

/**
 * -----------------------------------------------------------------------------
 * Preferred Language Schema
 * -----------------------------------------------------------------------------
 */

const preferredLanguageSchema = z
  .string()
  .trim()
  .min(2, 'Invalid preferred language.')
  .max(MAX_LANGUAGE_LENGTH, `Preferred language must not exceed ${MAX_LANGUAGE_LENGTH} characters.`)
  .regex(/^[a-zA-Z-]+$/, 'Preferred language contains invalid characters.');

/**
 * -----------------------------------------------------------------------------
 * Update Profile Schema
 *
 * IMPORTANT:
 * All fields are optional because onboarding is multi-step.
 *
 * profileCompleted is intentionally NOT accepted from client.
 * -----------------------------------------------------------------------------
 */

export const updateProfileSchema = z
  .object({
    firstName: nameSchema.optional(),

    lastName: lastNameSchema.nullable().optional(),

    city: citySchema.nullable().optional(),

    gender: genderSchema.nullable().optional(),

    profileImageUrl: profileImageUrlSchema.nullable().optional(),

    avatarId: avatarIdSchema.nullable().optional(),

    dateOfBirth: dateOfBirthSchema.nullable().optional(),

    preferredLanguage: preferredLanguageSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one profile field is required.',
  });

/**
 * -----------------------------------------------------------------------------
 * Avatar Update Schema
 * -----------------------------------------------------------------------------
 */

export const updateAvatarSchema = z
  .object({
    avatarId: avatarIdSchema,
  })
  .strict();

/**
 * -----------------------------------------------------------------------------
 * Profile Photo Update Schema
 * -----------------------------------------------------------------------------
 */

export const updateProfileImageSchema = z
  .object({
    profileImageUrl: profileImageUrlSchema,
  })
  .strict();

/**
 * -----------------------------------------------------------------------------
 * Delete Profile Photo Schema
 *
 * Empty body is intentionally supported because the
 * authenticated user is identified from the access token.
 * -----------------------------------------------------------------------------
 */

export const deleteProfileImageSchema = z.object({}).strict();
