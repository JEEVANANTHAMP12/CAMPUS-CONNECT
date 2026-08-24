const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const LOCK_TIME = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'hod', 'admin', 'leader', 'sub_leader'],
      default: 'student',
    },
    department: { type: String, trim: true, maxlength: 80 },
    year: { type: Number, min: 1, max: 5 },
    skills: [{ type: String, trim: true, maxlength: 40 }],
    bio: { type: String, trim: true, maxlength: 500 },
    profileImage: {
      type: String,
      default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    privacySettings: {
      profileVisible: { type: Boolean, default: true },
      achievementsVisible: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ department: 1, role: 1 });
UserSchema.index({ name: 'text', email: 'text' });

UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(env.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
};

UserSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  return this.passwordChangedAt.getTime() / 1000 > jwtIat;
};

UserSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
    return this.save({ validateBeforeSave: false });
  }
  this.loginAttempts += 1;
  if (this.loginAttempts >= MAX_ATTEMPTS && !this.isLocked) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  return this.save({ validateBeforeSave: false });
};

UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
