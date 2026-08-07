// Standard API Response Helper
/**
 * -----------------------------------------------------------------------------
 * File: api-response.js
 * Description:
 * Standard API Response Builder for CricNova Backend.
 *
 * Purpose:
 * - Provides a consistent success response format across the application.
 * - Supports metadata for pagination, request tracing, etc.
 * - Keeps controllers clean and standardized.
 *
 * Author: CricNova Backend
 * -----------------------------------------------------------------------------
 */

class ApiResponse {
  /**
   * Creates a standard API response object.
   *
   * @param {Object} options
   * @param {boolean} options.success
   * @param {string} options.message
   * @param {*} options.data
   * @param {Object|null} options.meta
   */
  constructor({
    success = true,
    message = 'Request processed successfully.',
    data = null,
    meta = null,
  } = {}) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  /**
   * Success Response
   *
   * @param {string} message
   * @param {*} data
   * @param {Object|null} meta
   * @returns {ApiResponse}
   */
  static success(message = 'Request processed successfully.', data = null, meta = null) {
    return new ApiResponse({
      success: true,
      message,
      data,
      meta,
    });
  }
}

export default ApiResponse;
