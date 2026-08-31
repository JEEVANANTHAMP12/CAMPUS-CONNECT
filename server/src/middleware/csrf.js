const crypto = require('crypto');

const CSRF_SECRET = crypto.randomBytes(32).toString('hex');
const CSRF_COOKIE = '_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Double-submit cookie CSRF protection.
 * Works with SPAs: server sets a random cookie, client sends it back as header.
 * Since JS on the origin can read the cookie and set the header, but a cross-origin
 * site cannot read our cookies (SameSite=Lax), this prevents CSRF.
 */
const generateToken = (req, res, next) => {
  if (!req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  next();
};

const verifyToken = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
    });
  }

  next();
};

module.exports = { generateToken, verifyToken };
