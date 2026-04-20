'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Plus, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { ChatSession } from '@careercompass/types';

export default function ChatPage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () =>
      apiClient.get<{ data: ChatSession[] }>('/chat/sessions').then((r) => r.data.data),
  });

  const createSession = useMutation({
    mutationFn: () =>
      apiClient.post<{ data: ChatSession }>('/chat/sessions', {}).then((r) => r.data.data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setActiveSession(session.id);
    },
  });

  if (activeSession) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <button
          onClick={() => setActiveSession(null)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to conversations
        </button>
        <ChatInterface sessionId={activeSession} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Career Coach</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Chat with your personalized AI career coach.
          </p>
        </div>
        <button
          onClick={() => createSession.mutate()}
          disabled={createSession.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {!sessions?.length ? (
        <div className="text-center py-20">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start your first conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your AI career coach is ready to help with job search, interview prep, salary
            negotiation, and more.
          </p>
          <button
            onClick={() => createSession.mutate()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className="w-full text-left p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {session.title ?? 'Career Chat'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(session.updatedAt)}
                </span>
              </div>
              {session.lastMessage && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {session.lastMessage.content}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
