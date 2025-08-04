import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import cors from 'cors';

const app = express();
const server = createServer(app);

// Allow your front-end origin
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Keep track of which sockets are in which group
const groupRooms = new Map<string, Set<string>>();

io.on('connection', socket => {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on('join group', (groupId: string) => {
    // Leave all other rooms
    socket.rooms.forEach(r => {
      if (r !== socket.id) socket.leave(r);
    });

    // Join the new room
    socket.join(groupId);

    // Track state
    if (!groupRooms.has(groupId)) {
      groupRooms.set(groupId, new Set());
    }
    groupRooms.get(groupId)!.add(socket.id);

    console.log(`👥 ${socket.id} joined ${groupId} (total: ${groupRooms.get(groupId)!.size})`);
  });

  // Tasks: broadcast to the room
  socket.on('task_created', (data) => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => io.to(room).emit('task_created', data));
  });

  socket.on('task_updated', (data) => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => io.to(room).emit('task_updated', data));
  });

  socket.on('task_deleted', (data) => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => io.to(room).emit('task_deleted', data));
  });

  socket.on('disconnect', reason => {
    console.log(`❌ Disconnected: ${socket.id} (${reason})`);
    
    // Clean up from groupRooms
    groupRooms.forEach((sockets, groupId) => {
      if (sockets.delete(socket.id)) {
        console.log(`🗑️ Removed ${socket.id} from ${groupId}`);
        if (sockets.size === 0) {
          groupRooms.delete(groupId);
          console.log(`🧹 Cleared empty group ${groupId}`);
        }
      }
    });
  });

  socket.on('error', err => {
    console.error(`⚠️ Socket error ${socket.id}:`, err);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
