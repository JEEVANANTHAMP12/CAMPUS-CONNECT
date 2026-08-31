const logger = require('../config/logger');

const AUDIT_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];
const AUDIT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/password',
  '/api/admin/',
  '/api/users/',
  '/api/messages/',
];

const isAuditTarget = (method, path) => {
  if (!AUDIT_METHODS.includes(method)) return false;
  return AUDIT_PATHS.some((p) => path.startsWith(p));
};

const auditLog = (req, res, next) => {
  if (!isAuditTarget(req.method, req.originalUrl)) return next();

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.audit({
      action: `${req.method} ${req.originalUrl}`,
      userId: req.user?.id || null,
      ip: req.ip || req.connection?.remoteAddress,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      detail: { duration: `${duration}ms`, body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined },
    });
  });

  next();
};

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...body };
  const sensitiveKeys = ['password', 'currentPassword', 'newPassword', 'token', 'secret'];
  for (const key of sensitiveKeys) {
    if (sanitized[key]) sanitized[key] = '[REDACTED]';
  }
  return sanitized;
}

module.exports = auditLog;
