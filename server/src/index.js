const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const connectDB = require('./config/db');
const env = require('./config/env');
const logger = require('./config/logger');
const { applySecurityMiddleware } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initSockets } = require('./sockets');

// Verify the Supabase service-role connection.
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with strict CORS and authentication
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const checkOrigin = (origin, callback) => {
  if (
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    env.nodeEnv !== 'production'
  ) {
    return callback(null, true);
  }
  return callback(new Error('CORS not allowed for this origin'));
};

const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 25000,
});

// Pass io to request object for event broadcasting if needed
app.set('io', io);

// Security & Performance Middlewares
applySecurityMiddleware(app);
app.use(compression());
app.use(cookieParser());

// Strict CORS configuration
app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Payload size limits to prevent memory exhaustion
app.use(express.json({ limit: env.maxBodySize }));
app.use(express.urlencoded({ extended: true, limit: env.maxBodySize }));

// Serve static uploads with secure headers
app.use('/uploads', express.static('uploads', {
  dotfiles: 'ignore',
  etag: true,
  maxAge: '7d',
}));

// SEO Routes (robots.txt, sitemap.xml)
app.use('/', require('./routes/seo'));

// Health & Root Status Endpoints (exempt from rate limiter for monitors & Render health checks)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Campus Connect API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Apply global API rate limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/security', require('./routes/security'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));

// Root fallback when frontend is not served by backend
app.get('/', (req, res, next) => {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    return next();
  }
  res.status(200).json({
    success: true,
    message: 'Campus Connect API Server is online and active.',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

// Initialize secure sockets
initSockets(io);

// Start HTTP Server
const PORT = env.port;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by another process.`);
  } else {
    logger.error('Server error:', err);
  }
});

const initKeepAlive = require('./utils/keepAlive');

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Enterprise Server running in ${env.nodeEnv} mode on port ${PORT} (0.0.0.0)`);
  initKeepAlive();
});


// Graceful shutdown handling
const shutdown = (signal) => {
  logger.info(`${signal} received. Closing HTTP server and freeing socket...`);
  server.close(() => {
    logger.info('Server closed. Process exiting cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});


module.exports = { app, server, io };
