'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatSession, ChatMessage } from '@careercompass/types';

interface StreamMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  streaming?: boolean;
}

interface Props {
  sessionId: string;
}

export function ChatInterface({ sessionId }: Props) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: session } = useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: () =>
      apiClient.get<{ data: ChatSession }>(`/chat/sessions/${sessionId}`).then((r) => r.data.data),
  });

  useEffect(() => {
    if (session?.messages) {
      setMessages(
        session.messages.map((m: ChatMessage) => ({
          id: m.id,
          role: m.role as 'USER' | 'ASSISTANT',
          content: m.content,
        }))
      );
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    setInput('');
    const userMsg: StreamMessage = { id: Date.now().toString(), role: 'USER', content };
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: StreamMessage = { id: aiMsgId, role: 'ASSISTANT', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const apiUrl =
        (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000') + '/api/v1';

      const authHeader = apiClient.defaults.headers.common?.['Authorization'] as string | undefined;

      const response = await fetch(`${apiUrl}/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ content }),
        signal: abortRef.current.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        const { value } = result;
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (!data.trim()) continue;

          try {
            const event = JSON.parse(data) as { type: string; content?: string };
            if (event.type === 'token' && event.content) {
              aiContent += event.content;
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: aiContent } : m))
              );
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m))
              );
            }
          } catch {
            // Parse error, skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {session?.title ?? 'Career Chat'}
        </h3>
        <p className="text-xs text-gray-500">Powered by Claude AI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-gray-500 text-sm">
              Ask me anything about your career — jobs, interviews, salary, or skill development.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'USER' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'USER'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
              )}
            >
              {msg.content || (msg.streaming && <span className="animate-pulse">●</span>)}
              {msg.streaming && msg.content && (
                <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your career coach..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
