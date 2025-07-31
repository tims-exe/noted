// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// CHANGE: Added proper TypeScript interfaces instead of using 'any'
interface TaskData {
  id: string;
  title: string;     
  description: string;
  status: string;
}

interface UserData {
  userId: string;
}

interface WebSocketEventData {
  task_created: TaskData;
  task_updated: TaskData;
  task_deleted: { id: string };
  user_joined: UserData;
  user_left: UserData;
}

interface UseWebSocketProps {
  onMessage?: <K extends keyof WebSocketEventData>(event: K, data: WebSocketEventData[K]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({ onMessage, onConnect, onDisconnect }: UseWebSocketProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentGroupRef = useRef<string | null>(null);

  const connectToGroup = useCallback((groupCode: string) => {
    console.log('🔌 useWebSocket: Attempting to connect to group:', groupCode);
    
    // Check if already connected to the same group
    // if (socketRef.current?.connected && socketRef.current.handshake?.query?.groupCode === groupCode) {
    //   console.log('⚠️ useWebSocket: Already connected to this group, skipping connection');
    //   return;
    // }
    if (socketRef.current?.connected && currentGroupRef.current === groupCode) {
        return;
    }

    currentGroupRef.current = groupCode;

    // Disconnect existing socket if connecting to different group
    if (socketRef.current) {
      console.log('🔌 useWebSocket: Disconnecting existing socket for group change');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    console.log('🔌 useWebSocket: Connecting to:', socketUrl);

    const socket = io(socketUrl, {
      path: "/socket.io",  // Default Socket.IO path
      withCredentials: true,          
      query: { groupCode },  // Changed from groupId to groupCode         
      transports: ['websocket', 'polling'], // Allow both transports
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true, // Force a new connection instead of reusing
    });

    socket.on("connect", () => {
      console.log('✅ useWebSocket: Socket connected successfully to group:', groupCode);
      console.log('🔌 useWebSocket: Socket ID:', socket.id);
      setIsConnected(true);
      setError(null);
      onConnect?.();
    });

    socket.on("connect_error", (err) => {
      console.error('❌ useWebSocket: Socket connection error:', err);
      console.error('❌ useWebSocket: Error details:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log('🔌 useWebSocket: Socket disconnected, reason:', reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log('🔄 useWebSocket: Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on("reconnect_error", (error) => {
      console.error('❌ useWebSocket: Reconnection error:', error);
    });

    // CHANGE: Added proper typing for event listeners
    socket.on('task_created', (data: TaskData) => {
      console.log('📝 useWebSocket: Received task_created:', data);
      onMessage?.('task_created', data);
    });
    
    socket.on('task_updated', (data: TaskData) => {
      console.log('✏️ useWebSocket: Received task_updated:', data);
      onMessage?.('task_updated', data);
    });
    
    socket.on('task_deleted', (data: { id: string }) => {
      console.log('🗑️ useWebSocket: Received task_deleted:', data);
      onMessage?.('task_deleted', data);
    });
    
    socket.on('user_joined', (data: UserData) => {
      console.log('👤 useWebSocket: Received user_joined:', data);
      onMessage?.('user_joined', data);
    });
    
    socket.on('user_left', (data: UserData) => {
      console.log('👤 useWebSocket: Received user_left:', data);
      onMessage?.('user_left', data);
    });

    socketRef.current = socket;
  }, [onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 useWebSocket: Disconnecting socket manually');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setError(null);
    } else {
      console.log('⚠️ useWebSocket: No socket to disconnect');
    }
  }, []);

  // CHANGE: Added proper typing for emit function
  const emit = useCallback(<K extends keyof WebSocketEventData>(event: K, data: WebSocketEventData[K]) => {
    if (socketRef.current?.connected) {
      console.log('📤 useWebSocket: Emitting event:', event, 'with data:', data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ useWebSocket: Cannot emit - socket not connected');
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log('🧹 useWebSocket: Cleanup - disconnecting socket');
      disconnect();
    };
  }, [disconnect]);

  return { 
    isConnected, 
    error, 
    connectToGroup, 
    disconnect, 
    emit 
  };
}