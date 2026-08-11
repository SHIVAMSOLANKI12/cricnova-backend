/**
 * -----------------------------------------------------------------------------
 * File: upload.middleware.js
 * Description:
 * Enterprise File Upload Middleware
 *
 * Responsibilities:
 * - Accept multipart/form-data uploads
 * - Use memory storage for object-storage workflows
 * - Restrict file count
 * - Enforce maximum file size
 * - Restrict supported MIME types
 * - Validate basic binary image signatures
 * - Keep upload middleware generic and reusable
 *
 * Designed for:
 * - User profile photos
 * - Team logos
 * - Player photos
 * - Tournament/media assets
 * - Future cricket media uploads
 *
 * NOTE:
 * - No database logic
 * - No storage-provider logic
 * - No user/profile business logic
 * - Actual persistence happens later in StorageProvider/Service
 * -----------------------------------------------------------------------------
 */

import multer from 'multer';

import AppError from '../../common/errors/app-error.js';
import ErrorCodes from '../../common/errors/error-codes.js';
import ErrorMessages from '../../common/errors/error-messages.js';

import {
  ALLOWED_IMAGE_MIME_TYPES,
  STORAGE_LIMITS,
  STORAGE_ERROR_CODE,
} from '../../storage/storage.constants.js';

/**
 * -----------------------------------------------------------------------------
 * Memory Storage
 * -----------------------------------------------------------------------------
 *
 * Files are kept in memory temporarily and then passed to the storage provider.
 *
 * We intentionally do NOT use diskStorage here because the production
 * architecture is based on object storage such as S3/Cloudinary.
 */
const memoryStorage = multer.memoryStorage();

/**
 * -----------------------------------------------------------------------------
 * MIME Type Validation
 * -----------------------------------------------------------------------------
 *
 * MIME type is only the first security layer.
 * Actual binary signature is validated separately below.
 */
function isAllowedMimeType(mimetype) {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimetype);
}

/**
 * -----------------------------------------------------------------------------
 * JPEG Signature
 * -----------------------------------------------------------------------------
 *
 * JPEG starts with:
 * FF D8 FF
 */
function isJpeg(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

/**
 * -----------------------------------------------------------------------------
 * PNG Signature
 * -----------------------------------------------------------------------------
 *
 * PNG signature:
 * 89 50 4E 47 0D 0A 1A 0A
 */
function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

/**
 * -----------------------------------------------------------------------------
 * WebP Signature
 * -----------------------------------------------------------------------------
 *
 * WebP container:
 *
 * RIFF....WEBP
 */
function isWebp(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

/**
 * -----------------------------------------------------------------------------
 * Binary Image Validation
 * -----------------------------------------------------------------------------
 */
function isValidImageSignature(buffer, mimetype) {
  if (!Buffer.isBuffer(buffer)) {
    return false;
  }

  switch (mimetype) {
    case 'image/jpeg':
      return isJpeg(buffer);

    case 'image/png':
      return isPng(buffer);

    case 'image/webp':
      return isWebp(buffer);

    default:
      return false;
  }
}

/**
 * -----------------------------------------------------------------------------
 * Multer Error Normalization
 * -----------------------------------------------------------------------------
 */
function normalizeMulterError(error) {
  if (!error) {
    return null;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError({
        message: ErrorMessages.FILE_TOO_LARGE ?? 'Uploaded file is too large.',

        code: ErrorCodes.FILE_TOO_LARGE ?? STORAGE_ERROR_CODE.FILE_TOO_LARGE,

        statusCode: 400,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return new AppError({
        message: ErrorMessages.TOO_MANY_FILES ?? 'Too many files uploaded.',

        code: ErrorCodes.TOO_MANY_FILES ?? STORAGE_ERROR_CODE.TOO_MANY_FILES,

        statusCode: 400,
      });
    }

    return new AppError({
      message: ErrorMessages.INVALID_FILE_UPLOAD ?? 'Invalid file upload.',

      code: ErrorCodes.INVALID_FILE_UPLOAD ?? 'INVALID_FILE_UPLOAD',

      statusCode: 400,
    });
  }

  return error;
}

/**
 * -----------------------------------------------------------------------------
 * Single Image Upload Factory
 * -----------------------------------------------------------------------------
 *
 * Generic middleware so the same infrastructure can later support:
 *
 * - profile photo
 * - team logo
 * - player image
 * - tournament image
 * etc.
 *
 * @param {Object} options
 * @param {string} options.fieldName
 * @param {number} options.maxSize
 */
export function createSingleImageUpload({
  fieldName,
  maxSize = STORAGE_LIMITS.PROFILE_PHOTO_MAX_SIZE_BYTES,
}) {
  if (!fieldName) {
    throw new Error('Upload fieldName is required.');
  }

  const upload = multer({
    storage: memoryStorage,

    limits: {
      files: STORAGE_LIMITS.PROFILE_PHOTO_MAX_FILES,

      fileSize: maxSize,
    },

    fileFilter: (req, file, callback) => {
      if (!isAllowedMimeType(file.mimetype)) {
        return callback(
          new AppError({
            message: ErrorMessages.UNSUPPORTED_FILE_TYPE ?? 'Unsupported image type.',

            code: ErrorCodes.UNSUPPORTED_FILE_TYPE ?? STORAGE_ERROR_CODE.UNSUPPORTED_FILE_TYPE,

            statusCode: 400,
          })
        );
      }

      callback(null, true);
    },
  });

  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error) {
        return next(normalizeMulterError(error));
      }

      /**
       * ---------------------------------------------------------------
       * File Required
       * ---------------------------------------------------------------
       */
      if (!req.file) {
        return next(
          new AppError({
            message: ErrorMessages.FILE_REQUIRED ?? 'Image file is required.',

            code: ErrorCodes.FILE_REQUIRED ?? STORAGE_ERROR_CODE.FILE_REQUIRED,

            statusCode: 400,
          })
        );
      }

      /**
       * ---------------------------------------------------------------
       * Binary Signature Validation
       * ---------------------------------------------------------------
       *
       * MIME type alone is not sufficient.
       */
      if (!isValidImageSignature(req.file.buffer, req.file.mimetype)) {
        return next(
          new AppError({
            message: ErrorMessages.INVALID_FILE_CONTENT ?? 'Uploaded file is not a valid image.',

            code: ErrorCodes.INVALID_FILE_CONTENT ?? STORAGE_ERROR_CODE.INVALID_FILE_CONTENT,

            statusCode: 400,
          })
        );
      }

      return next();
    });
  };
}

/**
 * -----------------------------------------------------------------------------
 * Profile Photo Upload Middleware
 * -----------------------------------------------------------------------------
 *
 * Current endpoint:
 *
 * PUT /api/v1/users/me/photo
 *
 * Expected multipart field:
 *
 * photo
 */
export const profilePhotoUpload = createSingleImageUpload({
  fieldName: 'photo',

  maxSize: STORAGE_LIMITS.PROFILE_PHOTO_MAX_SIZE_BYTES,
});

export default {
  createSingleImageUpload,
  profilePhotoUpload,
};
