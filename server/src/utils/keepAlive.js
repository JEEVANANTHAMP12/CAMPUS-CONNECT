const https = require('https');
const http = require('http');
const logger = require('../config/logger');

/**
 * Initializes automated keep-alive ping for Render Free Tier hosting.
 * Render spins down free instances after 15 minutes of inactivity.
 * Pinging every 10 minutes keeps the instance warm and prevents sleep mode.
 */
const initKeepAlive = () => {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

  if (!targetUrl || process.env.NODE_ENV !== 'production') {
    return;
  }

  const pingUrl = `${targetUrl.replace(/\/$/, '')}/api/health`;
  const intervalMs = 10 * 60 * 1000; // 10 minutes

  logger.info(`Keep-alive service initialized. Pinging ${pingUrl} every 10 minutes.`);

  setInterval(() => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      client
        .get(pingUrl, (res) => {
          if (res.statusCode === 200) {
            logger.info(`Keep-alive ping successful (${res.statusCode})`);
          } else {
            logger.warn(`Keep-alive ping returned status ${res.statusCode}`);
          }
        })
        .on('error', (err) => {
          logger.warn(`Keep-alive ping error: ${err.message}`);
        });
    } catch (err) {
      logger.warn(`Keep-alive error: ${err.message}`);
    }
  }, intervalMs);
};

module.exports = initKeepAlive;
