import { z } from 'zod';

export const CreateChatSessionSchema = z.object({
  title: z.string().max(200).optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export type CreateChatSessionInput = z.infer<typeof CreateChatSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
