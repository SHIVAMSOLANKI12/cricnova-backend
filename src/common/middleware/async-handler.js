/**
 * -----------------------------------------------------------------------------
 * File: async-handler.js
 * Description:
 * Async middleware wrapper for Express.
 *
 * Purpose:
 * - Eliminates repetitive try/catch blocks.
 * - Automatically forwards async errors to Express error middleware.
 * - Keeps controllers clean and focused.
 *
 * Usage:
 *
 * router.post(
 *   "/send-otp",
 *   asyncHandler(authController.sendOtp)
 * );
 *
 * -----------------------------------------------------------------------------
 */

/**
 * Wraps an async controller or middleware and forwards any rejected promise
 * to the next Express error middleware.
 *
 * @param {Function} handler
 * @returns {Function}
 */
const asyncHandler = (handler) => {
  if (typeof handler !== 'function') {
    throw new TypeError('asyncHandler expects a function as its argument.');
  }

  return async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };
};

export default asyncHandler;
