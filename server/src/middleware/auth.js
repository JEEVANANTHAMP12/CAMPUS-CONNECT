const jwt = require('jsonwebtoken');
const { supabase, maybeOne, publicUser } = require('../data');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

exports.protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = publicUser(await maybeOne(supabase.from('users').select('*').eq('id', decoded.id)));

  if (!user) throw ApiError.unauthorized('User not found');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');
  if (user.passwordChangedAt && new Date(user.passwordChangedAt).getTime() / 1000 > decoded.iat) {
    throw ApiError.unauthorized('Password recently changed. Please log in again');
  }

  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = publicUser(await maybeOne(supabase.from('users').select('*').eq('id', decoded.id)));
  } catch {
    req.user = null;
  }
  next();
});
