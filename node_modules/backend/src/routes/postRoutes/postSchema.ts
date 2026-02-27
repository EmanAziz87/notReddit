import z from "zod";

export interface MulterS3File extends Express.Multer.File {
  bucket: string;
  key: string;
  location: string;
  etag: string;
}

export type CreatePostInput = z.infer<typeof CreatePost>;

export const CreatePost = z.object({
  title: z.string(),
  content: z.string(),
  mediaUrl: z.string().optional(),
});

export type PostParams = z.infer<typeof PostParamsData>;

export const PostParamsData = z
  .object({
    communityId: z.coerce.number(),
    postId: z.coerce.number().optional(),
  })
  .strict();

export const EditPost = z
  .object({
    content: z.string(),
  })
  .strict();

export type EditPostInput = z.infer<typeof EditPost>;
