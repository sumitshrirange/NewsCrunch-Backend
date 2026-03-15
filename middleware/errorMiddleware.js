/**
 * Centralised error handler — attach { status } to your thrown errors
 * and this middleware picks it up cleanly.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err.message);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ success: false, error: message });
};

/**
 * Wrap async route handlers so errors bubble to errorHandler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
