import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : '';

const socket = io(BACKEND_URL || window.location.origin, {
  autoConnect: false,
  transports: ['polling', 'websocket'],
  path: '/socket.io',
  auth: (cb) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    cb({ token });
  },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Suppress unhandled connect_error when user is unauthenticated or switching routes
socket.on('connect_error', () => {
  // Silent fallback for intentional unauthenticated or background state
});

export default socket;
