import { InvalidRequestError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import {
  communityFoundOrThrow,
  postFoundOrThrow,
} from "../../lib/prismaHelpers";
import type { CreatePostInput } from "../../routes/postRoutes/postSchema";
import type { UserNoSensitiveInfo } from "../../types/express-session";
import type {
  FollowedCommunitiesWithRelations,
  PostsWithRelations,
} from "./typesPostServices";

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

const getAllPostsFollowedService = async (
  user: UserNoSensitiveInfo,
): Promise<FollowedCommunitiesWithRelations[]> => {
  const userIdNumber = Number(user.id);

  if (user.followingCount === 0) {
    throw new InvalidRequestError(
      "You are not following any communities to grab posts from",
    );
  }

  return prisma.followedCommunities.findMany({
    where: {
      userId: userIdNumber,
    },
    include: {
      community: {
        include: {
          posts: {
            include: {
              author: {
                select: {
                  username: true,
                  admin: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const editPostService = async () => {};

export default {
  createPostService,
  getPostService,
  getAllPostsService,
  getAllPostsFollowedService,
};
