const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/apiResponse');
const { verify } = require('../utils/token');
const User = require('../models/user.model');

function getBearer(req) {
  const h = req.headers.authorization;
  return h && h.startsWith('Bearer ') ? h.slice(7) : null;
}

// Hard gate — used on any route that must have a logged-in user.
function authenticate(req, _res, next) {
  const token = getBearer(req);
  if (!token) return next(new ApiError('Access denied — no token', 401, 'NO_TOKEN'));
  try {
    req.userId = verify(token).userId;
    return next();
  } catch (err) {
    return next(err); // JWT errors normalized to 403 in errorHandler.js
  }
}

// Soft gate — used on routes that behave differently for guests vs. logged-in users.
// Never rejects the request.
function optionalAuth(req, _res, next) {
  const token = getBearer(req);
  if (!token) return next();
  try {
    req.userId = verify(token).userId;
  } catch {
    /* invalid/expired token on an optional route — proceed as anonymous */
  }
  return next();
}

// Must run after authenticate. Re-fetches the admin/ban flags fresh from the DB
// on every request (not cached on the JWT) so a ban or role change takes effect
// immediately instead of waiting for the access token to expire.
async function requireAdmin(req, _res, next) {
  try {
    if (!req.userId) return next(new ApiError('Access denied', 401, 'NO_TOKEN'));
    const user = await User.findById(req.userId).select('isAdmin isBanned');
    if (!user || !user.isAdmin) return next(new ApiError('Admin access required', 403, 'ADMIN_REQUIRED'));
    if (user.isBanned) return next(new ApiError('Account suspended', 403, 'BANNED'));
    return next();
  } catch (err) {
    return next(err);
  }
}

const skipOutsideProd = () => process.env.NODE_ENV !== 'production';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProd,
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProd,
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProd,
});

module.exports = { authenticate, optionalAuth, requireAdmin, loginLimiter, registerLimiter, forgotPasswordLimiter };
