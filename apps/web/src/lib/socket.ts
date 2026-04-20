'use client';

import { io, type Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@careercompass/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socketInstance) {
    const wsUrl = process.env['NEXT_PUBLIC_WS_URL'] ?? 'http://localhost:4000';
    socketInstance = io(wsUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    }) as TypedSocket;
  }
  return socketInstance;
}

export function connectSocket(token: string): TypedSocket {
  const socket = getSocket();
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
  }
}
