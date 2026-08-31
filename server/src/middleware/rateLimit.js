const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const formatRateLimitMessage = (msg) => (req, res) => {
  res.status(429).json({
    success: false,
    message: msg,
    retryAfter: res.getHeader('Retry-After') || Math.ceil(env.rateLimitWindowMs / 1000),
  });
};

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: formatRateLimitMessage('Too many requests from this IP. Please try again later.'),
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { xForwardedForHeader: false },
  handler: formatRateLimitMessage('Too many authentication attempts. Please try again in 15 minutes.'),
});

const actionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: formatRateLimitMessage('You are performing actions too quickly. Please slow down.'),
});

module.exports = { apiLimiter, authLimiter, actionLimiter };
