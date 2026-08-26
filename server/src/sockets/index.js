const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../config/logger');
const { supabase, maybeOne } = require('../data');

const onlineUsers = new Map();

const getToken = (socket) => {
  const auth = socket.handshake.auth?.token;
  if (auth) return auth;
  const header = socket.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.split(' ')[1];
  const cookie = socket.handshake.headers?.cookie || '';
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const initSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) return next(new Error('Not authorized'));
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await maybeOne(supabase.from('users').select('id,name,role,is_active').eq('id', decoded.id));
      if (!user || !user.isActive) return next(new Error('Not authorized'));
      socket.userId = user.id;
      socket.userName = user.name;
      next();
    } catch {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    logger.debug(`Socket connected ${socket.userId}`);

    socket.on('join-room', (roomId) => {
      if (typeof roomId !== 'string' || roomId.length > 80) return;
      const parts = roomId.split('-');
      if (parts.includes(socket.userId)) socket.join(roomId);
    });

    socket.on('join-club', (clubId) => {
      if (typeof clubId === 'string' && clubId.length <= 40) {
        socket.join(`club:${clubId}`);
      }
    });

    socket.on('typing', (data) => {
      const receiver = data?.receiver;
      if (!receiver) return;
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit('user-typing', { userId: socket.userId });
      }
    });

    socket.on('stop-typing', (data) => {
      const receiver = data?.receiver;
      if (!receiver) return;
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit('user-stop-typing', { userId: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(socket.userId) === socket.id) {
        onlineUsers.delete(socket.userId);
      }
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
};

const emitToUser = (io, userId, event, payload) => {
  const socketId = onlineUsers.get(String(userId));
  if (socketId) io.to(socketId).emit(event, payload);
};

module.exports = { initSockets, emitToUser, onlineUsers };
