const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
const MAX_SESSIONS = 10;
const isProd = process.env.NODE_ENV === 'production';

function signAccess(userId) {
  return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRE });
}

function signRefresh(userId, familyId) {
  return jwt.sign(
    { userId, type: 'refresh', fid: familyId, nonce: crypto.randomBytes(9).toString('base64url') },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function newFamilyId() {
  return crypto.randomBytes(12).toString('hex');
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

// Called on login/register/refresh success — mints a fresh access+refresh pair
// and records the new session on the user document.
async function issueSession(user) {
  const familyId = newFamilyId();
  const refreshToken = signRefresh(user._id, familyId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.startRefreshSession(familyId, hashToken(refreshToken), expiresAt, MAX_SESSIONS);
  return { accessToken: signAccess(user._id), refreshToken };
}

module.exports = {
  signAccess,
  signRefresh,
  verify,
  hashToken,
  newFamilyId,
  refreshCookieOptions,
  issueSession,
  MAX_SESSIONS,
};
