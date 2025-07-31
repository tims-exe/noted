// server.ts (outside src folder)
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const server = createServer(app);

console.log('🚀 Starting Socket.IO server...');

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store group rooms and their connected users
const groupRooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  const groupCode = socket.handshake.query.groupCode as string;
  console.log('🏠 Client requesting to join group:', groupCode);

  if (groupCode) {
    // Join the group room
    socket.join(groupCode);
    console.log(`✅ Socket ${socket.id} joined group room: ${groupCode}`);

    // Track users in this group
    if (!groupRooms.has(groupCode)) {
      groupRooms.set(groupCode, new Set());
    }
    groupRooms.get(groupCode)?.add(socket.id);

    // Notify others in the group that a user joined
    socket.to(groupCode).emit('user_joined', { 
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
    console.log(`📢 Notified group ${groupCode} that user ${socket.id} joined`);

    // Log current room size
    const roomSize = groupRooms.get(groupCode)?.size || 0;
    console.log(`👥 Group ${groupCode} now has ${roomSize} connected users`);
  }

  // Handle task-related events
  socket.on('task_created', (data) => {
    console.log('📝 Received task_created from', socket.id, ':', data);
    if (groupCode) {
      socket.to(groupCode).emit('task_created', data);
      console.log(`📤 Broadcasted task_created to group ${groupCode}`);
    }
  });

  socket.on('task_updated', (data) => {
    console.log('✏️ Received task_updated from', socket.id, ':', data);
    if (groupCode) {
      socket.to(groupCode).emit('task_updated', data);
      console.log(`📤 Broadcasted task_updated to group ${groupCode}`);
    }
  });

  socket.on('task_deleted', (data) => {
    console.log('🗑️ Received task_deleted from', socket.id, ':', data);
    if (groupCode) {
      socket.to(groupCode).emit('task_deleted', data);
      console.log(`📤 Broadcasted task_deleted to group ${groupCode}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
    
    if (groupCode) {
      // Remove user from group tracking
      const groupUsers = groupRooms.get(groupCode);
      if (groupUsers) {
        groupUsers.delete(socket.id);
        console.log(`👤 Removed ${socket.id} from group ${groupCode}`);
        
        // If group is empty, clean up
        if (groupUsers.size === 0) {
          groupRooms.delete(groupCode);
          console.log(`🧹 Cleaned up empty group: ${groupCode}`);
        } else {
          // Notify others that user left
          socket.to(groupCode).emit('user_left', { 
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
          console.log(`📢 Notified group ${groupCode} that user ${socket.id} left`);
        }
      }
      
      const remainingUsers = groupRooms.get(groupCode)?.size || 0;
      console.log(`👥 Group ${groupCode} now has ${remainingUsers} connected users`);
    }
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error for', socket.id, ':', error);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;

server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
  console.log(`🔗 CORS origin set to: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Socket.IO server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;







// import { createServer } from "node:http";
// import { Server as SocketIOServer } from "socket.io";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./src/lib/auth"; 
// import type { NextApiRequest, NextApiResponse } from "next";

// const httpServer = createServer();
// const io = new SocketIOServer(httpServer, {
//   path: "/socket",
//   cors: { 
//     origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
// });

// io.use(async (socket, next) => {
//   try {
//     const { groupId } = socket.handshake.query;
    
//     if (!groupId) {
//       return next(new Error("GroupId required"));
//     }

//     // Get session from NextAuth cookie  
//     const req = socket.request as unknown as NextApiRequest;
//     const res = {} as NextApiResponse;

//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user) {
//       return next(new Error("Not authenticated"));
//     }

//     socket.data.userId = session.user.id;
//     socket.data.groupId = groupId;
//     next();
//   } catch (error) {
//     console.error("Socket auth error:", error);
//     next(new Error("Authentication failed"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log(`User ${socket.data.userId} connected to group ${socket.data.groupId}`);
  
//   // Join the group room
//   socket.join(socket.data.groupId);
  
//   // Notify others that user joined
//   socket.to(socket.data.groupId).emit("user_joined", {
//     userId: socket.data.userId
//   });

//   // Handle task events
//   socket.on("task_created", (task) => {
//     socket.to(socket.data.groupId).emit("task_created", task);
//   });

//   socket.on("task_updated", (task) => {
//     socket.to(socket.data.groupId).emit("task_updated", task);
//   });

//   socket.on("task_deleted", (data) => {
//     socket.to(socket.data.groupId).emit("task_deleted", data);
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log(`User ${socket.data.userId} disconnected from group ${socket.data.groupId}`);
//     socket.to(socket.data.groupId).emit("user_left", {
//       userId: socket.data.userId
//     });
//   });
// });

// const PORT = process.env.SOCKET_PORT || 4000;
// httpServer.listen(PORT, () => {
//   console.log(`Socket server listening on port ${PORT}`);
// });