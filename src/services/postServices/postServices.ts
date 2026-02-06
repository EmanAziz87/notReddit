import prisma from "../../lib/prisma";
import {
  communityFoundOrThrow,
  postFoundOrThrow,
} from "../../lib/prismaHelpers";
import type { CreatePostInput } from "../../routes/postRoutes/postSchema";
import type { PostsWithRelations } from "./typesPostServices";

const createPostService = async (
  postInputData: CreatePostInput,
  communityId: number,
  userId: string,
  imageLocationUrls: string[] | null,
) => {
  const userIdNumber = Number(userId);

  communityFoundOrThrow(communityId);

  return prisma.posts.create({
    data: {
      title: postInputData.title,
      content: postInputData.content,
      mediaUrl: imageLocationUrls ? imageLocationUrls.map((url) => url) : [],
      authorId: userIdNumber,
      communityId: communityId,
    },
    include: {
      community: true,
      comments: true,
    },
  });
};

const getPostService = async (
  communityId: number,
  postId: number,
): Promise<PostsWithRelations> => {
  return await postFoundOrThrow(communityId, postId);
};

const getAllPostsService = async (
  communityId: number,
): Promise<[PostsWithRelations[], string]> => {
  const foundCommunity = await communityFoundOrThrow(communityId);

  const allPosts = await prisma.posts.findMany({
    include: {
      community: true,
      comments: true,
      author: {
        select: {
          id: true,
          username: true,
          admin: true,
        },
      },
    },
  });

  return [allPosts, foundCommunity.name];
};

export default { createPostService, getPostService, getAllPostsService };
