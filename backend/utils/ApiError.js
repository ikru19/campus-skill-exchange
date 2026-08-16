// ============================================
// utils/ApiError.js - custom error class so controllers can
// throw an error with a specific HTTP status code attached
// ============================================
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ApiError;
