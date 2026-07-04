const { fail } = require('../utils/apiResponse');

function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, [{ code: 'NOT_FOUND' }]);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Express 5 requires the 4-arg signature even where `next` is unused.
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return fail(res, 'Validation failed', 400, errors);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return fail(res, 'Duplicate value', 409, [{ field, code: 'DUPLICATE' }]);
  }
  if (err.name === 'CastError') {
    return fail(res, 'Invalid id', 400, [{ field: err.path, code: 'INVALID_ID' }]);
  }
  if (err.name === 'TokenExpiredError') return fail(res, 'Session expired', 403, [{ code: 'TOKEN_EXPIRED' }]);
  if (err.name === 'JsonWebTokenError') return fail(res, 'Invalid token', 403, [{ code: 'INVALID_TOKEN' }]);

  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  return fail(res, err.message || 'Server error', status, err.errors || (err.code ? [{ code: err.code }] : []));
}

module.exports = { notFound, errorHandler };
