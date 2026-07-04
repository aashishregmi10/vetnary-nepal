const crypto = require('crypto');
const User = require('../models/user.model');
const { ok, created, fail, ApiError } = require('../utils/apiResponse');
const { issueSession, signAccess, signRefresh, hashToken, verify, refreshCookieOptions } = require('../utils/token');

async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return fail(res, 'Email, password and full name are required', 400, [{ code: 'MISSING_FIELDS' }]);
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return fail(res, 'An account with this email already exists', 409, [{ field: 'email', code: 'DUPLICATE' }]);

    const user = await User.create({ email, password, fullName });
    const { accessToken, refreshToken } = await issueSession(user);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return created(res, { user, accessToken }, 'Account created');
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password are required', 400, [{ code: 'MISSING_FIELDS' }]);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
    if (!user) return fail(res, 'Invalid email or password', 401, [{ code: 'INVALID_CREDENTIALS' }]);
    if (user.isBanned) return fail(res, 'This account has been suspended', 403, [{ code: 'BANNED' }]);

    const matches = await user.comparePassword(password);
    if (!matches) return fail(res, 'Invalid email or password', 401, [{ code: 'INVALID_CREDENTIALS' }]);

    user.lastLogin = new Date();
    const { accessToken, refreshToken } = await issueSession(user);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return ok(res, { user, accessToken }, 'Logged in');
  } catch (err) {
    return next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password +refreshTokens');
    if (!user) return fail(res, 'Invalid email or password', 401, [{ code: 'INVALID_CREDENTIALS' }]);
    if (!user.isAdmin) return fail(res, 'Admin access required', 403, [{ code: 'ADMIN_REQUIRED' }]);
    if (user.isBanned) return fail(res, 'This account has been suspended', 403, [{ code: 'BANNED' }]);

    const matches = await user.comparePassword(password);
    if (!matches) return fail(res, 'Invalid email or password', 401, [{ code: 'INVALID_CREDENTIALS' }]);

    user.lastLogin = new Date();
    const { accessToken, refreshToken } = await issueSession(user);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return ok(res, { user, accessToken }, 'Logged in');
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return fail(res, 'No refresh token', 401, [{ code: 'NO_TOKEN' }]);

    let decoded;
    try {
      decoded = verify(token);
    } catch (err) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return next(err);
    }

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return fail(res, 'Session expired', 401, [{ code: 'NO_TOKEN' }]);
    }

    const nextRefreshToken = signRefresh(user._id, decoded.fid);
    const nextHash = hashToken(nextRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = await user.rotateRefreshSession(decoded.fid, hashToken(token), nextHash, expiresAt);

    if (result === 'reuse') {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return fail(res, 'Refresh token reuse detected — all sessions revoked', 401, [{ code: 'TOKEN_REUSE' }]);
    }
    if (result === 'unknown') {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return fail(res, 'Session expired', 401, [{ code: 'NO_TOKEN' }]);
    }

    res.cookie('refreshToken', nextRefreshToken, refreshCookieOptions);
    return ok(res, { accessToken: signAccess(user._id) }, 'Refreshed');
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verify(token);
        await User.updateOne({ _id: decoded.userId }, { $pull: { refreshTokens: { familyId: decoded.fid } } });
      } catch {
        /* token already invalid/expired — nothing to revoke */
      }
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return ok(res, null, 'Logged out');
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(new ApiError('User not found', 404, 'NOT_FOUND'));
    return ok(res, user, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { fullName, phone, avatar, notificationPreferences } = req.body;
    const update = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (phone !== undefined) update.phone = phone;
    if (avatar !== undefined) update.avatar = avatar;
    if (notificationPreferences !== undefined) update.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true });
    return ok(res, user, 'Profile updated');
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return fail(res, 'Current and new password are required', 400, [{ code: 'MISSING_FIELDS' }]);
    }
    const user = await User.findById(req.userId).select('+password');
    const matches = await user.comparePassword(currentPassword);
    if (!matches) return fail(res, 'Current password is incorrect', 401, [{ code: 'INVALID_CREDENTIALS' }]);

    user.password = newPassword;
    await user.save();
    return ok(res, null, 'Password changed');
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always return the same response whether the email exists or not — avoids account enumeration.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      // TODO: wire up real email delivery (see src/email/templates/passwordReset.js).
      // Logging the link locally for now so the flow is testable end-to-end without a mail provider.
      console.log(`[auth] password reset link for ${user.email}: /auth/reset-password?token=${rawToken}`);
    }
    return ok(res, null, 'If that email exists, a reset link has been sent');
  } catch (err) {
    return next(err);
  }
}

async function verifyResetToken(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return fail(res, 'Token required', 400, [{ code: 'MISSING_FIELDS' }]);
    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });
    return ok(res, { valid: !!user }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return fail(res, 'Token and new password are required', 400, [{ code: 'MISSING_FIELDS' }]);

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return fail(res, 'Reset link is invalid or has expired', 400, [{ code: 'INVALID_TOKEN' }]);

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return ok(res, null, 'Password reset — you can now log in');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  refresh,
  logout,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
