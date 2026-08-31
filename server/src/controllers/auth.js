const bcrypt = require('bcryptjs');
const { supabase, one, maybeOne, publicUser, many, enrich } = require('../data');
const sendTokenResponse = require('../utils/sendToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick } = require('../utils/pick');
const env = require('../config/env');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, department, year, skills } = req.body;
  // Register is student-only: ignore any client role and force student
  if (!name || !email || !password) throw ApiError.badRequest('Name, email and password are required');
  if (await maybeOne(supabase.from('users').select('id').eq('email', String(email).toLowerCase()))) throw ApiError.conflict('User already exists');
  const hash = await bcrypt.hash(password, env.bcryptRounds);
  const user = publicUser(await one(supabase.from('users').insert({ name, email: String(email).toLowerCase(), password: hash, role: 'student', department: department || null, year: year ? Number(year) : null, skills: Array.isArray(skills) ? skills.slice(0, 20) : [] }).select()));
  sendTokenResponse(user, 201, res);
});
exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const user = await maybeOne(supabase.from('users').select('*').eq('email', email));
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.is_active === false) throw ApiError.forbidden('Account is disabled');
  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    throw ApiError.tooMany('Account locked. Try again in 15 minutes');
  }

  let isMatch = false;
  try {
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }
  } catch (e) {
    isMatch = false;
  }

  if (!isMatch) {
    const attempts = user.lock_until && new Date(user.lock_until) < new Date() ? 1 : ((user.login_attempts || 0) + 1);
    try {
      await supabase.from('users').update({
        login_attempts: attempts,
        lock_until: attempts >= 5 ? new Date(Date.now() + 900000).toISOString() : null,
      }).eq('id', user.id);
    } catch (e) {}
    throw ApiError.unauthorized('Invalid credentials');
  }

  let cleanUser = null;
  try {
    const updated = await one(supabase.from('users').update({
      login_attempts: 0,
      lock_until: null,
      last_login: new Date().toISOString(),
    }).eq('id', user.id).select());
    cleanUser = publicUser(updated);
  } catch (e) {
    cleanUser = publicUser(user);
  }

  sendTokenResponse(cleanUser, 200, res);
});
exports.logout = asyncHandler(async (_req, res) => { res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true }); res.status(200).json({ success: true, message: 'Logged out' }); });
exports.getMe = asyncHandler(async (req, res) => {
  const user = publicUser(await maybeOne(supabase.from('users').select('*').eq('id', req.user.id)));
  const memberships = await many(supabase.from('club_members').select('club_id').eq('user_id', req.user.id));
  user.clubs = await Promise.all(memberships.map(async ({ club_id }) => enrich('clubs', await maybeOne(supabase.from('clubs').select('*').eq('id', club_id)))));
  user.achievements = await Promise.all((await many(supabase.from('achievements').select('*').eq('user_id', req.user.id))).map((a) => enrich('achievements', a)));
  res.status(200).json({ success: true, data: user });
});
exports.updateProfile = asyncHandler(async (req, res) => { const updates = pick(req.body, ['name', 'department', 'year', 'skills', 'bio', 'profileImage', 'privacySettings']); if (updates.profileImage !== undefined) { updates.profile_image = updates.profileImage; delete updates.profileImage; } if (updates.privacySettings !== undefined) { updates.privacy_settings = updates.privacySettings; delete updates.privacySettings; } res.status(200).json({ success: true, data: publicUser(await one(supabase.from('users').update(updates).eq('id', req.user.id).select())) }); });
exports.updatePassword = asyncHandler(async (req, res) => { const user = await maybeOne(supabase.from('users').select('*').eq('id', req.user.id)); if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) throw ApiError.unauthorized('Current password is incorrect'); const clean = publicUser(await one(supabase.from('users').update({ password: await bcrypt.hash(req.body.newPassword, env.bcryptRounds), password_changed_at: new Date().toISOString() }).eq('id', user.id).select())); sendTokenResponse(clean, 200, res); });
