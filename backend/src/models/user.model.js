const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

const addressSchema = new Schema(
  {
    label: String, // "Home", "Office"
    fullName: String,
    phone: String,
    province: { type: String, enum: PROVINCES },
    city: String,
    street: String,
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required() {
        return !this.googleId;
      },
      select: false,
      minlength: 8,
    },
    googleId: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    phone: String,
    avatar: String,
    avatarPublicId: String,

    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    bannedAt: Date,

    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

    refreshTokens: {
      type: [{ familyId: String, tokenHash: String, expiresAt: Date }],
      select: false,
      default: [],
    },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    isEmailVerified: { type: Boolean, default: false },
    lastLogin: Date,
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false); // Google-only account, no local password
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.pruneRefreshTokens = function pruneRefreshTokens() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > now);
};

userSchema.methods.startRefreshSession = async function startRefreshSession(
  familyId,
  tokenHash,
  expiresAt,
  maxSessions = 10
) {
  this.pruneRefreshTokens();
  this.refreshTokens.push({ familyId, tokenHash, expiresAt });
  if (this.refreshTokens.length > maxSessions) {
    this.refreshTokens = this.refreshTokens.slice(-maxSessions); // drop oldest sessions
  }
  await this.save();
};

// Returns 'ok' | 'reuse' | 'unknown'. Called from POST /auth/refresh.
userSchema.methods.rotateRefreshSession = async function rotateRefreshSession(
  familyId,
  presentedHash,
  nextHash,
  expiresAt
) {
  const entry = this.refreshTokens.find((t) => t.familyId === familyId);
  if (!entry) return 'unknown'; // session expired/logged out elsewhere
  if (entry.tokenHash !== presentedHash) {
    // Presented token doesn't match what we last issued — someone replayed an old
    // refresh token. Treat the whole family as compromised and kill every session in it.
    this.refreshTokens = this.refreshTokens.filter((t) => t.familyId !== familyId);
    await this.save();
    return 'reuse';
  }
  entry.tokenHash = nextHash;
  entry.expiresAt = expiresAt;
  await this.save();
  return 'ok';
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('User', userSchema);
module.exports.PROVINCES = PROVINCES;
