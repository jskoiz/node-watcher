import { z } from "zod";
import { UserStubSchema } from "./common";

// ── GET /matches ────────────────────────────────────────────────────

export const MatchSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  user: UserStubSchema,
  lastMessage: z.string().nullable(),
});

export const MatchListSchema = z.array(MatchSchema);

export type Match = z.infer<typeof MatchSchema>;

// ── GET /matches/:id/messages ───────────────────────────────────────

export const ChatMessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.enum(["me", "them"]),
  timestamp: z.coerce.date().optional(),
});

export const ChatMessageListSchema = z.array(ChatMessageSchema);

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ── POST /matches/:id/messages ──────────────────────────────────────

export const SendMessageResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.literal("me"),
  timestamp: z.coerce.date(),
});

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
