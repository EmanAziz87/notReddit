import z from "zod";

export type CommentParams = z.infer<typeof CommentParamsData>;

export const CommentParamsData = z.object({
  postId: z.coerce.number(),
  commentId: z.coerce.number().optional(),
  reaction: z.enum(["LIKE", "DISLIKE", "NONE"]).optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentData>;

export const CreateCommentData = z
  .object({
    content: z.string(),
  })
  .strict();

export const CommentReactionData = z.object({
  reaction: z.enum(["LIKE", "DISLIKE", "NONE"]),
});

export type CommentReaction = z.infer<typeof CommentReactionData>;
