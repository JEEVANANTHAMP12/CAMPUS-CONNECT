const env = require('./env');

const stamp = () => new Date().toISOString();

const logger = {
  info: (msg, meta) => {
    if (meta) console.log(`${stamp()} [INFO] ${msg}`, meta);
    else console.log(`${stamp()} [INFO] ${msg}`);
  },
  warn: (msg, meta) => {
    if (meta) console.warn(`${stamp()} [WARN] ${msg}`, meta);
    else console.warn(`${stamp()} [WARN] ${msg}`);
  },
  error: (msg, meta) => {
    if (meta) console.error(`${stamp()} [ERROR] ${msg}`, meta);
    else console.error(`${stamp()} [ERROR] ${msg}`);
  },
  debug: (msg, meta) => {
    if (env.isProd) return;
    if (meta) console.log(`${stamp()} [DEBUG] ${msg}`, meta);
    else console.log(`${stamp()} [DEBUG] ${msg}`);
  },
};

module.exports = logger;
