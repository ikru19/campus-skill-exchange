// ============================================
// middleware/errorMiddleware.js - Catches every thrown error and
// sends back a consistent { success:false, message } JSON response
// ============================================

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((v) => v.message).join(", ");
  }
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already in use`;
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
