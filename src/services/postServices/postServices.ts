import type { CreatePostInput } from "../../routes/postRoutes/postSchema";

const createPostService = (
  postInputData: CreatePostInput,
  communityId: number,
  userId: string,
  imageLocationUrls: string[],
) => {
  const userIdNumber = Number(userId);
};

export default { createPostService };
