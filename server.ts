import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./src/lib/auth"; 
import type { NextApiRequest, NextApiResponse } from "next";

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  path: "/socket",
  cors: { 
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.use(async (socket, next) => {
  try {
    const { groupId } = socket.handshake.query;
    
    if (!groupId) {
      return next(new Error("GroupId required"));
    }

    // Get session from NextAuth cookie  
    const req = socket.request as unknown as NextApiRequest;
    const res = {} as NextApiResponse;

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return next(new Error("Not authenticated"));
    }

    socket.data.userId = session.user.id;
    socket.data.groupId = groupId;
    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.data.userId} connected to group ${socket.data.groupId}`);
  
  // Join the group room
  socket.join(socket.data.groupId);
  
  // Notify others that user joined
  socket.to(socket.data.groupId).emit("user_joined", {
    userId: socket.data.userId
  });

  // Handle task events
  socket.on("task_created", (task) => {
    socket.to(socket.data.groupId).emit("task_created", task);
  });

  socket.on("task_updated", (task) => {
    socket.to(socket.data.groupId).emit("task_updated", task);
  });

  socket.on("task_deleted", (data) => {
    socket.to(socket.data.groupId).emit("task_deleted", data);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.data.userId} disconnected from group ${socket.data.groupId}`);
    socket.to(socket.data.groupId).emit("user_left", {
      userId: socket.data.userId
    });
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});