import z from "zod";

export type CommentParams = z.infer<typeof CommentParamsData>;

export const CommentParamsData = z.object({
  postId: z.coerce.number(),
  commentId: z.coerce.number().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentData>;

export const CreateCommentData = z
  .object({
    content: z.string(),
  })
  .strict();
