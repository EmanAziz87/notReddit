import z from "zod";

export type MessageParams = z.infer<typeof MessageParamsData>;

export const MessageParamsData = z
  .object({
    conversationId: z.coerce.number(),
  })
  .strict();

export type CreateMessageData = z.infer<typeof CreateMessage>;

export const CreateMessage = z
  .object({
    content: z.string(),
  })
  .strict();
