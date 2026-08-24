const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const env = require('../config/env');

/**
 * Configure Helmet with secure HTTP headers
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://www.gravatar.com',
        'https://via.placeholder.com',
        'https://ui-avatars.com',
      ],
      connectSrc: [
        "'self'",
        'ws:',
        'wss:',
        env.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: env.isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * Mongo Sanitize to prevent NoSQL query operator injection
 */
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    if (!env.isProd) {
      console.warn(`[SECURITY] Sanitized forbidden NoSQL key "${key}" in request to ${req.originalUrl}`);
    }
  },
});

/**
 * HTTP Parameter Pollution prevention
 */
const hppMiddleware = hpp({
  whitelist: ['role', 'department', 'skills', 'status', 'type', 'category', 'tags'],
});

/**
 * Recursive string cleaner to sanitize potential HTML/Script payloads
 */
const cleanString = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');
};

const xssSanitizer = (req, _res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

/**
 * Combine all security middleware into a unified handler array
 */
const applySecurityMiddleware = (app) => {
  app.use(helmetMiddleware);
  app.use(mongoSanitizeMiddleware);
  app.use(hppMiddleware);
  app.use(xssSanitizer);
};

module.exports = {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssSanitizer,
  applySecurityMiddleware,
};
