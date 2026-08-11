/**
 * -----------------------------------------------------------------------------
 * File: storage.provider.js
 * Description:
 * Enterprise Storage Provider Contract
 *
 * Responsibilities:
 * - Define a consistent interface for storage operations
 * - Keep application services independent from storage vendors
 * - Standardize upload and delete operations
 *
 * Supported future providers:
 * - Local filesystem
 * - AWS S3
 * - Cloudinary
 * - Other object-storage providers
 *
 * NOTE:
 * - No Express logic
 * - No Prisma/database logic
 * - No vendor SDK
 * - No user-specific business logic
 * -----------------------------------------------------------------------------
 */

import AppError from '../common/errors/app-error.js';
import ErrorCodes from '../common/errors/error-codes.js';
import ErrorMessages from '../common/errors/error-messages.js';

class StorageProvider {
  /**
   * ---------------------------------------------------------------------------
   * Upload Asset
   * ---------------------------------------------------------------------------
   *
   * @param {Object} params
   * @param {Buffer} params.buffer
   * @param {string} params.mimeType
   * @param {string} params.key
   * @param {string} params.assetType
   *
   * @returns {Promise<Object>}
   *
   * Expected provider result:
   *
   * {
   *   key: "profiles/user-id/generated-id.webp",
   *   url: "https://cdn.example.com/...",
   * }
   */
  async upload() {
    throw new AppError({
      message:
        ErrorMessages.STORAGE_PROVIDER_NOT_IMPLEMENTED ??
        'Storage upload provider is not implemented.',

      code: ErrorCodes.STORAGE_PROVIDER_NOT_IMPLEMENTED ?? 'STORAGE_PROVIDER_NOT_IMPLEMENTED',

      statusCode: 500,
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Delete Asset
   * ---------------------------------------------------------------------------
   *
   * @param {Object} params
   * @param {string} params.key
   *
   * @returns {Promise<void>}
   */
  async delete() {
    throw new AppError({
      message:
        ErrorMessages.STORAGE_PROVIDER_NOT_IMPLEMENTED ??
        'Storage delete provider is not implemented.',

      code: ErrorCodes.STORAGE_PROVIDER_NOT_IMPLEMENTED ?? 'STORAGE_PROVIDER_NOT_IMPLEMENTED',

      statusCode: 500,
    });
  }
}

export default StorageProvider;
