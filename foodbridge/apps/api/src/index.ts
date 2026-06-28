import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';

const PORT = process.env.PORT || 4000;

const httpServer = http.createServer(app);

// ─── Socket.io type definitions ───────────────────────────────────────────────
// Fix: Socket.io 4 with TypeScript requires event payload types to be declared
// via generic type parameters on the Server, not as inline annotations on
// socket.on() callbacks. Inline types cause TS2345 / implicit-any errors.
interface VolunteerLocationPayload {
  volunteerId: string;
  lat: number;
  lng: number;
}

// Socket.io — volunteer location broadcast (Phase 5)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Volunteer location namespace
const volunteerNs = io.of('/volunteer');

volunteerNs.on('connection', (socket) => {
  console.info(`[Socket] Volunteer connected: ${socket.id}`);

  // Volunteer emits GPS every 10 seconds (Phase 5)
  // Fix: cast the callback argument instead of annotating the parameter type
  socket.on('location:update', (data) => {
    const payload = data as VolunteerLocationPayload;
    // Broadcast to NGO room watching this volunteer
    volunteerNs.to(`ngo:${payload.volunteerId}`).emit('volunteer:location', payload);
  });

  socket.on('join:ngo-room', (volunteerId) => {
    const id = volunteerId as string;
    socket.join(`ngo:${id}`);
  });

  socket.on('disconnect', () => {
    console.info(`[Socket] Volunteer disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.info(`🌉 FoodBridge API running on port ${PORT}`);
  console.info(`📡 Socket.io ready on ws://localhost:${PORT}`);
});

export { io };
