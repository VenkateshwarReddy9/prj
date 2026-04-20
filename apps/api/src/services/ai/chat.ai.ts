import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.js';
import { anthropicService } from './anthropic.service.js';
import { buildChatSystemPrompt } from '../../prompts/chat-system.js';
import { AI_MODELS } from '@careercompass/constants';
import type { AIStreamEvent } from '@careercompass/types';
import type { User as PrismaUser, ChatMessage } from '@prisma/client';
import type { AssessmentResult } from '@careercompass/types';

export async function *streamChatResponse(
  user: PrismaUser,
  history: ChatMessage[],
  newMessage: string,
  latestResult?: AssessmentResult | null
): AsyncGenerator<AIStreamEvent> {
  const systemPrompt = buildChatSystemPrompt(user, latestResult);

  const messages: MessageParam[] = [
    ...history.slice(-20).map((msg) => ({
      role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: newMessage },
  ];

  yield* anthropicService.streamMessage({
    model: AI_MODELS.SONNET,
    system: systemPrompt,
    messages,
    maxTokens: 1500,
    userId: user.id,
    feature: 'chat',
  });
}
