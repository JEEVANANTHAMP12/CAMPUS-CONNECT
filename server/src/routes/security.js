const express = require('express');
const router = express.Router();
const os = require('os');
const { protect, authorize } = require('../middleware/auth');
const env = require('../config/env');

/**
 * Public basic health check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
  });
});

/**
 * Protected security diagnostic endpoint for admins
 */
router.get('/diagnostics', protect, authorize('admin', 'hod'), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      security: {
        helmetActive: true,
        mongoSanitizeActive: true,
        rateLimiterActive: true,
        hppActive: true,
        xssSanitizerActive: true,
        jwtExpiry: env.jwtExpire,
        bcryptRounds: env.bcryptRounds,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        loadAverage: os.loadavg(),
        freeMemoryMb: Math.round(os.freemem() / (1024 * 1024)),
        totalMemoryMb: Math.round(os.totalmem() / (1024 * 1024)),
      },
      audit: {
        timestamp: new Date().toISOString(),
        requestedBy: req.user.email,
      },
    },
  });
});

module.exports = router;
