/**
 * -----------------------------------------------------------------------------
 * File: cloudinary-storage.provider.js
 * Description:
 * Production Cloudinary Storage Provider
 *
 * Responsibilities:
 * - Upload image buffers to Cloudinary
 * - Generate server-controlled public IDs
 * - Keep assets inside CricNova's storage namespace
 * - Delete existing Cloudinary assets
 * - Return normalized storage metadata
 *
 * NOTE:
 * - No Express logic
 * - No Prisma/database logic
 * - No user business logic
 * - Client filename is NEVER trusted
 * - Cloudinary credentials remain server-side
 * -----------------------------------------------------------------------------
 */

import crypto from 'node:crypto';

import { v2 as cloudinary } from 'cloudinary';

import cloudinaryConfig from '../../config/cloudinary.config.js';

import StorageProvider from '../storage.provider.js';

import AppError from '../../common/errors/app-error.js';
import ErrorCodes from '../../common/errors/error-codes.js';
import ErrorMessages from '../../common/errors/error-messages.js';

import { STORAGE_ASSET_TYPE, STORAGE_KEY_PREFIX } from '../storage.constants.js';

/**
 * -----------------------------------------------------------------------------
 * Cloudinary SDK Configuration
 * -----------------------------------------------------------------------------
 */
if (cloudinaryConfig.isConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,

    api_key: cloudinaryConfig.apiKey,

    api_secret: cloudinaryConfig.apiSecret,

    secure: true,
  });
}

/**
 * -----------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------
 */
class CloudinaryStorageProvider extends StorageProvider {
  /**
   * ---------------------------------------------------------------------------
   * Constructor
   * ---------------------------------------------------------------------------
   */
  constructor() {
    super();

    this.isConfigured = cloudinaryConfig.isConfigured;
  }

  /**
   * ---------------------------------------------------------------------------
   * Ensure Provider Is Configured
   * ---------------------------------------------------------------------------
   */
  ensureConfigured() {
    if (!this.isConfigured) {
      throw new AppError({
        message:
          ErrorMessages.STORAGE_PROVIDER_NOT_CONFIGURED ?? 'Cloudinary storage is not configured.',

        code: ErrorCodes.STORAGE_PROVIDER_NOT_CONFIGURED ?? 'STORAGE_PROVIDER_NOT_CONFIGURED',

        statusCode: 503,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Generate Server-Controlled Public ID
   * ---------------------------------------------------------------------------
   *
   * Example:
   *
   * cricnova/users/{userId}/profile/{uuid}
   *
   * IMPORTANT:
   * - User supplied filename is never used.
   * - UUID prevents collisions.
   * - User ID is sanitized before entering the storage path.
   */
  generatePublicId({ userId, assetType }) {
    const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '');

    const safeAssetType = String(assetType).replace(/[^a-zA-Z0-9_-]/g, '');

    const generatedId = crypto.randomUUID();

    return [
      'cricnova',
      STORAGE_KEY_PREFIX.PROFILE_PHOTO,
      safeUserId,
      safeAssetType,
      generatedId,
    ].join('/');
  }

  /**
   * ---------------------------------------------------------------------------
   * Upload Buffer
   * ---------------------------------------------------------------------------
   *
   * Cloudinary's upload_stream is appropriate for buffers/streams received
   * from Node.js applications.
   */
  uploadBuffer({ buffer, options }) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Upload Asset
   * ---------------------------------------------------------------------------
   */
  async upload({ buffer, mimeType, userId, assetType = STORAGE_ASSET_TYPE.PROFILE_PHOTO }) {
    this.ensureConfigured();

    /**
     * -------------------------------------------------------------------------
     * Input Guards
     * -------------------------------------------------------------------------
     */
    if (!Buffer.isBuffer(buffer)) {
      throw new AppError({
        message: ErrorMessages.INVALID_FILE_CONTENT ?? 'Invalid file content.',

        code: ErrorCodes.INVALID_FILE_CONTENT ?? 'INVALID_FILE_CONTENT',

        statusCode: 400,
      });
    }

    if (buffer.length === 0) {
      throw new AppError({
        message: ErrorMessages.INVALID_FILE_CONTENT ?? 'File cannot be empty.',

        code: ErrorCodes.INVALID_FILE_CONTENT ?? 'INVALID_FILE_CONTENT',

        statusCode: 400,
      });
    }

    if (!userId) {
      throw new AppError({
        message: ErrorMessages.UNAUTHORIZED ?? 'Authentication required.',

        code: ErrorCodes.UNAUTHORIZED ?? 'UNAUTHORIZED',

        statusCode: 401,
      });
    }

    if (!mimeType) {
      throw new AppError({
        message: 'MIME type is required.',

        code: 'STORAGE_MIME_TYPE_REQUIRED',

        statusCode: 400,
      });
    }

    /**
     * -------------------------------------------------------------------------
     * Generate Public ID
     * -------------------------------------------------------------------------
     */
    const publicId = this.generatePublicId({
      userId,
      assetType,
    });

    try {
      /**
       * -----------------------------------------------------------------------
       * Upload Options
       * -----------------------------------------------------------------------
       *
       * resource_type=image:
       * Ensures this asset is treated as an image.
       *
       * overwrite=false:
       * Prevents accidental replacement of another asset.
       *
       * unique_filename=false:
       * We already generate our own unique public ID.
       *
       * use_filename=false:
       * Client filename is never used.
       */
      const result = await this.uploadBuffer({
        buffer,

        options: {
          public_id: publicId,

          resource_type: 'image',

          overwrite: false,

          unique_filename: false,

          use_filename: false,

          type: 'upload',

          secure: true,
        },
      });

      /**
       * -----------------------------------------------------------------------
       * Normalize Provider Response
       * -----------------------------------------------------------------------
       */
      return {
        key: result.public_id,

        publicId: result.public_id,

        url: result.secure_url,

        mimeType,

        size: result.bytes,

        width: result.width ?? null,

        height: result.height ?? null,

        format: result.format ?? null,

        resourceType: result.resource_type ?? 'image',
      };
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.STORAGE_UPLOAD_FAILED ?? 'Failed to upload image.',

        code: ErrorCodes.STORAGE_UPLOAD_FAILED ?? 'STORAGE_UPLOAD_FAILED',

        statusCode: 502,

        cause: error,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Delete Asset
   * ---------------------------------------------------------------------------
   *
   * key/publicId returned by upload() is used here.
   */
  async delete({ key }) {
    this.ensureConfigured();

    if (!key) {
      return;
    }

    try {
      const result = await cloudinary.uploader.destroy(key, {
        resource_type: 'image',

        type: 'upload',

        invalidate: true,
      });

      /**
       * Cloudinary can return:
       * - "ok"
       * - "not found"
       *
       * Deleting an already missing asset is treated as idempotent.
       */
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary delete failed: ${result.result}`);
      }
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.STORAGE_DELETE_FAILED ?? 'Failed to delete image.',

        code: ErrorCodes.STORAGE_DELETE_FAILED ?? 'STORAGE_DELETE_FAILED',

        statusCode: 502,

        cause: error,
      });
    }
  }
}

export default new CloudinaryStorageProvider();
