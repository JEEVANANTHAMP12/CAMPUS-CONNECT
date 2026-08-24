const User = require('../models/User');
const sendTokenResponse = require('../utils/sendToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick } = require('../utils/pick');

const PUBLIC_ROLES = ['student'];

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, department, year, skills } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('User already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: PUBLIC_ROLES.includes(req.body.role) ? req.body.role : 'student',
    department,
    year,
    skills: Array.isArray(skills) ? skills.slice(0, 20) : [],
  });

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');
  if (user.isLocked) throw ApiError.tooMany('Account locked. Try again in 15 minutes');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    throw ApiError.unauthorized('Invalid credentials');
  }

  await user.resetLoginAttempts();
  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out' });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('clubs', 'name logo')
    .populate('achievements', 'title badge');
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = pick(req.body, [
    'name',
    'department',
    'year',
    'skills',
    'bio',
    'profileImage',
    'privacySettings',
  ]);
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});
