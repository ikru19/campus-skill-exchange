// ============================================
// utils/asyncHandler.js - wraps async route handlers so any
// thrown/rejected error is forwarded to the error middleware
// instead of needing try/catch in every controller
// ============================================
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
