const env = require('./env');

const structuredLog = (level, msg, meta) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: msg,
    pid: process.pid,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };
  return JSON.stringify(entry);
};

const plainLog = (level, msg, meta) => {
  const stamp = new Date().toISOString();
  if (meta) return `${stamp} [${level}] ${msg} ${JSON.stringify(meta)}`;
  return `${stamp} [${level}] ${msg}`;
};

const format = env.isProd ? structuredLog : plainLog;

const logger = {
  info: (msg, meta) => console.log(format('INFO', msg, meta)),
  warn: (msg, meta) => console.warn(format('WARN', msg, meta)),
  error: (msg, meta) => console.error(format('ERROR', msg, meta)),
  debug: (msg, meta) => {
    if (env.isProd) return;
    console.log(format('DEBUG', msg, meta));
  },
};

/**
 * Structured audit log for security-relevant events.
 * These are always logged regardless of environment.
 */
logger.audit = (event) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level: 'AUDIT',
    event: event.action,
    userId: event.userId || null,
    ip: event.ip || null,
    method: event.method || null,
    path: event.path || null,
    statusCode: event.statusCode || null,
    detail: event.detail || null,
    pid: process.pid,
  };
  const line = JSON.stringify(entry);
  console.log(line);
};

module.exports = logger;
