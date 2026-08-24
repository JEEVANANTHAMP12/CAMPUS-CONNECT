import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            const benignCodes = ['ECONNRESET', 'EPIPE', 'ECONNREFUSED', 'ETIMEDOUT'];
            if (!benignCodes.includes(err.code)) {
              console.warn('[vite-proxy] socket notice:', err.message);
            }
          });
          proxy.on('proxyReqWs', (_proxyReq, _req, socket, _options, _head) => {
            socket.on('error', (_err) => {
              // Gracefully handle client-side socket teardowns
            });
          });
          proxy.on('open', (proxySocket) => {
            proxySocket.on('error', (_err) => {
              // Gracefully handle backend-side socket teardowns (EPIPE, ECONNRESET)
            });
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          ui: ['lucide-react', 'react-hot-toast'],
          utils: ['axios', 'date-fns', 'socket.io-client', 'canvas-confetti'],
        },
      },
    },
  },
});
