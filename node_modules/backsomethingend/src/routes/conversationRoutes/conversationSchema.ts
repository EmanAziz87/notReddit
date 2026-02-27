import z from "zod";

export type ConversationCreateParams = z.infer<
  typeof ConversationCreateParamsData
>;

export const ConversationCreateParamsData = z
  .object({
    receiverId: z.coerce.number(),
  })
  .strict();

export type ConversationGetParams = z.infer<typeof ConversationGetParamsData>;

export const ConversationGetParamsData = z
  .object({
    conversationId: z.coerce.number(),
  })
  .strict();
