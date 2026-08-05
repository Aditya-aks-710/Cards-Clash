import { io } from 'socket.io-client';

// Point at the realtime server. Override in production via a .env: VITE_SERVER_URL=https://your-server
const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Single shared socket for the whole app; we connect lazily when entering online mode.
export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});
