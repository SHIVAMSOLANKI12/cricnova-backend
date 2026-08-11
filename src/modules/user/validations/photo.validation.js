/**
 * -----------------------------------------------------------------------------
 * File: photo.validation.js
 * Description:
 * Enterprise User Profile Photo Validation
 *
 * Responsibilities:
 * - Validate uploaded profile-photo contract
 * - Enforce profile-photo-specific limits
 * - Validate supported image types
 * - Validate normalized upload metadata
 * - Keep photo rules separate from generic upload middleware
 *
 * NOTE:
 * - No Express response handling
 * - No Prisma/database logic
 * - No storage-provider logic
 * - No user business workflow
 *
 * Generic transport-level upload validation is handled by:
 * src/common/middlewares/upload.middleware.js
 * -----------------------------------------------------------------------------
 */

import AppError from '../../../common/errors/app-error.js';
import ErrorCodes from '../../../common/errors/error-codes.js';
import ErrorMessages from '../../../common/errors/error-messages.js';

import {
  ALLOWED_IMAGE_MIME_TYPES,
  STORAGE_LIMITS,
  STORAGE_ERROR_CODE,
} from '../../../storage/storage.constants.js';

/**
 * -----------------------------------------------------------------------------
 * Validate Profile Photo
 * -----------------------------------------------------------------------------
 *
 * Expected normalized file contract:
 *
 * {
 *   buffer: Buffer,
 *   mimetype: "image/jpeg",
 *   size: 123456
 * }
 */
export function validateProfilePhoto(file) {
  /**
   * ---------------------------------------------------------------------------
   * File Existence
   * ---------------------------------------------------------------------------
   */
  if (!file) {
    throw new AppError({
      message: ErrorMessages.FILE_REQUIRED ?? 'Profile photo is required.',

      code: ErrorCodes.FILE_REQUIRED ?? STORAGE_ERROR_CODE.FILE_REQUIRED,

      statusCode: 400,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Buffer Validation
   * ---------------------------------------------------------------------------
   *
   * Storage workflow requires the file in memory.
   */
  if (!Buffer.isBuffer(file.buffer)) {
    throw new AppError({
      message: ErrorMessages.INVALID_FILE_CONTENT ?? 'Invalid profile photo content.',

      code: ErrorCodes.INVALID_FILE_CONTENT ?? STORAGE_ERROR_CODE.INVALID_FILE_CONTENT,

      statusCode: 400,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Empty File Protection
   * ---------------------------------------------------------------------------
   */
  if (file.buffer.length === 0) {
    throw new AppError({
      message: ErrorMessages.INVALID_FILE_CONTENT ?? 'Profile photo cannot be empty.',

      code: ErrorCodes.INVALID_FILE_CONTENT ?? STORAGE_ERROR_CODE.INVALID_FILE_CONTENT,

      statusCode: 400,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * File Size Validation
   * ---------------------------------------------------------------------------
   *
   * Middleware already enforces this limit.
   *
   * We intentionally keep a service-boundary validation as defense in depth.
   */
  if (file.size > STORAGE_LIMITS.PROFILE_PHOTO_MAX_SIZE_BYTES) {
    throw new AppError({
      message: ErrorMessages.FILE_TOO_LARGE ?? 'Profile photo is too large.',

      code: ErrorCodes.FILE_TOO_LARGE ?? STORAGE_ERROR_CODE.FILE_TOO_LARGE,

      statusCode: 400,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * MIME Type Validation
   * ---------------------------------------------------------------------------
   */
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError({
      message: ErrorMessages.UNSUPPORTED_FILE_TYPE ?? 'Unsupported profile photo type.',

      code: ErrorCodes.UNSUPPORTED_FILE_TYPE ?? STORAGE_ERROR_CODE.UNSUPPORTED_FILE_TYPE,

      statusCode: 400,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Normalized Photo Contract
   * ---------------------------------------------------------------------------
   *
   * Do not pass the entire Multer file object deeper into the application.
   *
   * Only expose the fields required by the photo/storage domain.
   */
  return Object.freeze({
    buffer: file.buffer,

    mimeType: file.mimetype,

    size: file.size,
  });
}

/**
 * -----------------------------------------------------------------------------
 * Validate Photo Upload Request
 * -----------------------------------------------------------------------------
 *
 * This is the service/controller boundary helper.
 */
export function validateProfilePhotoRequest(req) {
  return validateProfilePhoto(req?.file);
}

export default {
  validateProfilePhoto,
  validateProfilePhotoRequest,
};
