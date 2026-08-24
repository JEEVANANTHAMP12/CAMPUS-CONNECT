import { io } from 'socket.io-client';

const socket = io('/', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  auth: (cb) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    cb({ token });
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Suppress unhandled connect_error when user is unauthenticated or switching routes
socket.on('connect_error', (err) => {
  // Silent fallback for intentional unauthenticated or background state
});

export default socket;
