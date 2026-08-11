/**
 * -----------------------------------------------------------------------------
 * File: local-storage.provider.js
 * Description:
 * Local Development Storage Provider
 *
 * Responsibilities:
 * - Store uploaded assets on local filesystem
 * - Return a stable storage key
 * - Return a locally accessible URL
 * - Delete stored assets
 *
 * IMPORTANT:
 * - This provider is intended for development/testing.
 * - Production should use Cloudinary or S3.
 * - Application services must depend on StorageProvider abstraction,
 *   not directly on this implementation.
 * -----------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import StorageProvider from '../storage.provider.js';

import AppError from '../../common/errors/app-error.js';
import ErrorCodes from '../../common/errors/error-codes.js';
import ErrorMessages from '../../common/errors/error-messages.js';

import { STORAGE_KEY_PREFIX } from '../storage.constants.js';

class LocalStorageProvider extends StorageProvider {
  /**
   * ---------------------------------------------------------------------------
   * Constructor
   * ---------------------------------------------------------------------------
   */
  constructor() {
    super();

    this.baseDirectory = path.resolve(process.env.LOCAL_STORAGE_DIR ?? './storage/uploads');

    this.publicBaseUrl = (
      process.env.LOCAL_STORAGE_PUBLIC_URL ?? 'http://localhost:5000/uploads'
    ).replace(/\/+$/, '');
  }

  /**
   * ---------------------------------------------------------------------------
   * Ensure Storage Directory
   * ---------------------------------------------------------------------------
   */
  async ensureDirectory(directory) {
    try {
      await fs.mkdir(directory, {
        recursive: true,
      });
    } catch (error) {
      throw new AppError({
        message: ErrorMessages.STORAGE_UPLOAD_FAILED ?? 'Unable to initialize local storage.',

        code: ErrorCodes.STORAGE_UPLOAD_FAILED ?? 'STORAGE_UPLOAD_FAILED',

        statusCode: 500,

        cause: error,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Generate Safe Object Key
   * ---------------------------------------------------------------------------
   *
   * IMPORTANT:
   * Client filename is never used.
   */
  generateKey({ userId, assetType, extension }) {
    const randomId = crypto.randomUUID();

    const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '');

    const safeAssetType = String(assetType).replace(/[^a-zA-Z0-9_-]/g, '');

    const safeExtension = String(extension)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    return path.posix.join(
      STORAGE_KEY_PREFIX.PROFILE_PHOTO,
      safeUserId,
      safeAssetType,
      `${randomId}.${safeExtension}`
    );
  }

  /**
   * ---------------------------------------------------------------------------
   * Upload Asset
   * ---------------------------------------------------------------------------
   */
  async upload({ buffer, mimeType, userId, assetType, extension = 'webp' }) {
    if (!Buffer.isBuffer(buffer)) {
      throw new AppError({
        message: 'Storage upload requires a valid buffer.',

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

    if (!assetType) {
      throw new AppError({
        message: 'Storage asset type is required.',

        code: 'STORAGE_ASSET_TYPE_REQUIRED',

        statusCode: 400,
      });
    }

    if (!mimeType) {
      throw new AppError({
        message: 'Storage MIME type is required.',

        code: 'STORAGE_MIME_TYPE_REQUIRED',

        statusCode: 400,
      });
    }

    const key = this.generateKey({
      userId,
      assetType,
      extension,
    });

    /**
     * -------------------------------------------------------------------------
     * Convert POSIX storage key to OS filesystem path
     * -------------------------------------------------------------------------
     */
    const absolutePath = path.resolve(this.baseDirectory, key);

    /**
     * -------------------------------------------------------------------------
     * Path Traversal Protection
     * -------------------------------------------------------------------------
     */
    const normalizedBase = `${this.baseDirectory}${path.sep}`;

    if (!absolutePath.startsWith(normalizedBase)) {
      throw new AppError({
        message: 'Invalid storage path.',

        code: 'INVALID_STORAGE_PATH',

        statusCode: 500,
      });
    }

    try {
      /**
       * -----------------------------------------------------------------------
       * Create Parent Directory
       * -----------------------------------------------------------------------
       */
      await this.ensureDirectory(path.dirname(absolutePath));

      /**
       * -----------------------------------------------------------------------
       * Write File
       * -----------------------------------------------------------------------
       */
      await fs.writeFile(absolutePath, buffer);

      /**
       * -----------------------------------------------------------------------
       * Public URL
       * -----------------------------------------------------------------------
       */
      const url = `${this.publicBaseUrl}/${key.split(path.sep).join('/')}`;

      return {
        key,
        url,
        mimeType,
        size: buffer.length,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        message: ErrorMessages.STORAGE_UPLOAD_FAILED ?? 'Failed to upload asset.',

        code: ErrorCodes.STORAGE_UPLOAD_FAILED ?? 'STORAGE_UPLOAD_FAILED',

        statusCode: 500,

        cause: error,
      });
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Delete Asset
   * ---------------------------------------------------------------------------
   */
  async delete({ key }) {
    if (!key) {
      return;
    }

    const absolutePath = path.resolve(this.baseDirectory, key);

    const normalizedBase = `${this.baseDirectory}${path.sep}`;

    /**
     * -------------------------------------------------------------------------
     * Path Traversal Protection
     * -------------------------------------------------------------------------
     */
    if (!absolutePath.startsWith(normalizedBase)) {
      throw new AppError({
        message: 'Invalid storage path.',

        code: 'INVALID_STORAGE_PATH',

        statusCode: 500,
      });
    }

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      /**
       * File already deleted / missing:
       *
       * Treat delete as idempotent.
       */
      if (error?.code === 'ENOENT') {
        return;
      }

      throw new AppError({
        message: ErrorMessages.STORAGE_DELETE_FAILED ?? 'Failed to delete stored asset.',

        code: ErrorCodes.STORAGE_DELETE_FAILED ?? 'STORAGE_DELETE_FAILED',

        statusCode: 500,

        cause: error,
      });
    }
  }
}

export default new LocalStorageProvider();
