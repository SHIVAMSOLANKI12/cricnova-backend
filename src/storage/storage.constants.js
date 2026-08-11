/**
 * -----------------------------------------------------------------------------
 * File: storage.constants.js
 * Description:
 * Shared Storage Infrastructure Constants
 *
 * Responsibilities:
 * - Define supported storage asset types
 * - Define supported image MIME types
 * - Define upload size limits
 * - Define storage key prefixes
 *
 * NOTE:
 * - No Express logic
 * - No database logic
 * - No provider-specific implementation
 * - No user-specific business logic
 *
 * These constants are shared by upload middleware, validation and storage
 * providers.
 * -----------------------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------------------
 * Storage Asset Types
 * -----------------------------------------------------------------------------
 *
 * These values identify the purpose of an uploaded asset.
 *
 * Keep identifiers stable because they may eventually be used in:
 * - storage object keys
 * - audit logs
 * - analytics
 * - media metadata
 */
export const STORAGE_ASSET_TYPE = Object.freeze({
  PROFILE_PHOTO: 'PROFILE_PHOTO',
});

/**
 * -----------------------------------------------------------------------------
 * Supported Image MIME Types
 * -----------------------------------------------------------------------------
 *
 * Only formats explicitly supported by the application are allowed.
 *
 * IMPORTANT:
 * MIME type alone must NOT be treated as proof that the uploaded file is
 * actually an image. Binary/content validation will be performed by the
 * upload validation layer.
 */
export const STORAGE_MIME_TYPE = Object.freeze({
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
});

/**
 * -----------------------------------------------------------------------------
 * Allowed Image MIME Type List
 * -----------------------------------------------------------------------------
 */
export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  STORAGE_MIME_TYPE.JPEG,
  STORAGE_MIME_TYPE.PNG,
  STORAGE_MIME_TYPE.WEBP,
]);

/**
 * -----------------------------------------------------------------------------
 * Storage Upload Limits
 * -----------------------------------------------------------------------------
 *
 * Backend remains authoritative even if the frontend applies the same limits.
 */
export const STORAGE_LIMITS = Object.freeze({
  /**
   * Maximum profile photo size:
   * 5 MB
   */
  PROFILE_PHOTO_MAX_SIZE_BYTES: 5 * 1024 * 1024,

  /**
   * Maximum number of files accepted by a single profile photo request.
   *
   * Profile photo endpoint accepts exactly one image.
   */
  PROFILE_PHOTO_MAX_FILES: 1,
});

/**
 * -----------------------------------------------------------------------------
 * Storage Key Prefixes
 * -----------------------------------------------------------------------------
 *
 * Object keys must never use the client's original filename.
 *
 * Example:
 *
 * profiles/{userId}/{generated-id}.webp
 */
export const STORAGE_KEY_PREFIX = Object.freeze({
  PROFILE_PHOTO: 'profiles',
});

/**
 * -----------------------------------------------------------------------------
 * Storage Error Codes
 * -----------------------------------------------------------------------------
 *
 * Centralized codes prevent provider/middleware layers from inventing
 * inconsistent error identifiers.
 */
export const STORAGE_ERROR_CODE = Object.freeze({
  FILE_REQUIRED: 'FILE_REQUIRED',

  TOO_MANY_FILES: 'TOO_MANY_FILES',

  FILE_TOO_LARGE: 'FILE_TOO_LARGE',

  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',

  INVALID_FILE_CONTENT: 'INVALID_FILE_CONTENT',

  STORAGE_UPLOAD_FAILED: 'STORAGE_UPLOAD_FAILED',

  STORAGE_DELETE_FAILED: 'STORAGE_DELETE_FAILED',
});
