'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useNotificationStore } from '@/lib/stores/notification.store';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@careercompass/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<TypedSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const socketRef = useRef<TypedSocket | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!isSignedIn) return;

    let mounted = true;

    async function connect() {
      const token = await getToken();
      if (!token || !mounted) return;

      const socket = connectSocket(token);
      socketRef.current = socket;

      socket.on('notification:new', (notification) => {
        addNotification(notification);
      });
    }

    connect();

    return () => {
      mounted = false;
      disconnectSocket();
      socketRef.current = null;
    };
  }, [isSignedIn, getToken, addNotification]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext) ?? getSocket();
}
