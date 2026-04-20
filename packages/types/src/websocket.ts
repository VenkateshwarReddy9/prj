import type { Notification } from './notifications.js';

export interface ServerToClientEvents {
  'assessment:progress': (data: {
    jobId: string;
    step: number;
    total: number;
    message: string;
  }) => void;
  'assessment:complete': (data: { jobId: string; assessmentId: string }) => void;
  'assessment:error': (data: { jobId: string; error: string }) => void;
  'ai:token': (data: { sessionId: string; token: string }) => void;
  'ai:done': (data: { sessionId: string; tokensUsed: number }) => void;
  'ai:error': (data: { sessionId: string; error: string }) => void;
  'notification:new': (data: Notification) => void;
  'job:new-match': (data: { jobId: string; title: string; company: string; matchScore: number }) => void;
}

export interface ClientToServerEvents {
  'subscribe:assessment': (jobId: string) => void;
  'subscribe:chat': (sessionId: string) => void;
  unsubscribe: (room: string) => void;
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  clerkId: string;
}
