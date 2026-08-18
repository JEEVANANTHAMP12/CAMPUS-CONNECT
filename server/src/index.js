const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive-message', data);
    }
    io.to(data.room || socket.id).emit('receive-message', data);
  });

  socket.on('typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user-typing', { userId: data.sender });
    }
  });

  socket.on('stop-typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user-stop-typing', { userId: data.sender });
    }
  });

  socket.on('new-notification', (data) => {
    const receiverSocket = onlineUsers.get(data.userId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('notification', data);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
