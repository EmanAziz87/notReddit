import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { InvalidRequestError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import {
  communityFoundOrThrow,
  isPostOwnerOrThrow,
  postFoundInCommunityOrThrow,
  postFoundOrThrow,
  postMadeByUserOrThrow,
} from "../../lib/prismaHelpers";
import type { CreatePostInput } from "../../routes/postRoutes/postSchema";
import type { UserNoSensitiveInfo } from "../../types/express-session";
import s3Client from "../../util/s3client";
import type { FollowedCommunitiesWithRelations } from "./typesPostServices";
import type {
  PostsWithExtraData,
  PostsWithMinimalRelations,
  PostsWithRelations,
  PostsWithRelationsNoComments,
} from "../../types";
import type { ReactionType } from "../../../generated/prisma/enums";

const createPostService = async (
  postInputData: CreatePostInput,
  communityId: number,
  userId: number,
  imageLocationUrls: string[] | null,
) => {
  const userIdNumber = Number(userId);

  await communityFoundOrThrow(communityId);

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

const getAllPosts = async (): Promise<PostsWithMinimalRelations[]> => {
  return prisma.posts.findMany({
    include: {
      community: true,
      author: {
        select: {
          id: true,
          username: true,
          admin: true,
        },
      },
    },
  });
};

const getPostService = async (
  communityId: number,
  postId: number,
  userId: number | undefined,
): Promise<PostsWithExtraData> => {
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);

  let postLikedAlready;
  let postFavoritedAlready;
  let userReaction: "liked" | "disliked" | null = null;
  let favorited: boolean = false;

  if (userId) {
    postLikedAlready = await prisma.postReaction.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    postFavoritedAlready = await prisma.favoritedPosts.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (postLikedAlready?.type === "LIKE") {
      userReaction = "liked";
    }

    if (postLikedAlready?.type === "DISLIKE") {
      userReaction = "disliked";
    }

    if (postFavoritedAlready) {
      favorited = true;
    }
  }

  return {
    ...foundPost,
    userReaction: userReaction,
    favorited,
  };
};

const getAllCommunityPostsService = async (
  communityId: number,
  userId: number | undefined,
): Promise<PostsWithRelationsNoComments[]> => {
  await communityFoundOrThrow(communityId);

  const communityPosts =
    (await prisma.posts.findMany({
      where: {
        communityId,
      },
      include: {
        community: true,
        favoritedPosts: userId
          ? {
              where: {
                userId,
              },
              take: 1,
            }
          : false,
        postReaction: userId ? { where: { userId }, take: 1 } : false,
        author: {
          select: {
            id: true,
            username: true,
            admin: true,
          },
        },
      },
    })) || [];

  const communityPostsWithFavorited: PostsWithRelationsNoComments[] = [];

  if (userId) {
    communityPosts.forEach((post) => {
      let userReaction: "liked" | "disliked" | null = null;
      let favorited = false;
      if (post.favoritedPosts?.length > 0) {
        favorited = true;
      }

      if (post.postReaction?.[0]?.type === "LIKE") {
        userReaction = "liked";
      }

      if (post.postReaction?.[0]?.type === "DISLIKE") {
        userReaction = "disliked";
      }

      communityPostsWithFavorited.push({ ...post, favorited, userReaction });
    });
  }

  return communityPostsWithFavorited;
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

const editPostService = async (
  newContent: string,
  communityId: number,
  postId: number,
  userId: number,
): Promise<PostsWithRelations> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);
  await postMadeByUserOrThrow(foundPost.id, userIdNumber);

  return prisma.posts.update({
    where: {
      id: postId,
    },
    data: {
      content: newContent,
    },
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
};

const setPostReactionService = async (
  communityId: number,
  postId: number,
  userId: number,
  reaction: "LIKE" | "DISLIKE" | "NONE",
) => {
  const userIdNumber = Number(userId);
  await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(
    await communityFoundOrThrow(communityId),
    foundPost,
  );

  if (reaction === "NONE") {
    await prisma.postReaction.deleteMany({
      where: { userId: userIdNumber, postId },
    });
  } else {
    await prisma.postReaction.upsert({
      where: { userId_postId: { userId: userIdNumber, postId } },
      create: { userId: userIdNumber, postId, type: reaction },
      update: { type: reaction },
    });
  }

  const likeCount = await prisma.postReaction.count({
    where: { postId, type: "LIKE" },
  });
  const dislikeCount = await prisma.postReaction.count({
    where: { postId, type: "DISLIKE" },
  });

  return prisma.posts.update({
    where: { id: postId },
    data: { likes: likeCount - dislikeCount },
    include: {
      community: true,
      comments: true,
      author: { select: { id: true, username: true, admin: true } },
    },
  });
};

const setFavoritePostService = async (
  communityId: number,
  postId: number,
  userId: number,
  favorite: boolean,
): Promise<void> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);

  if (favorite) {
    await prisma.favoritedPosts.upsert({
      where: {
        userId_postId: {
          userId: userIdNumber,
          postId,
        },
      },
      create: {
        postId,
        userId: userIdNumber,
      },
      update: {},
    });
  } else {
    await prisma.favoritedPosts.deleteMany({
      where: {
        userId: userIdNumber,
        postId,
      },
    });
  }
};

const deletePostService = async (
  communityId: number,
  postId: number,
  userId: number,
): Promise<void> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);
  await isPostOwnerOrThrow(foundPost, userIdNumber);

  const queriesFinished = await prisma.$transaction(async (tx) => {
    await tx.favoritedPosts.deleteMany({
      where: {
        postId: postId,
      },
    });

    await tx.postReaction.deleteMany({
      where: {
        postId: postId,
      },
    });

    await tx.comments.deleteMany({
      where: {
        postId: postId,
      },
    });

    return await tx.posts.delete({
      where: {
        id: postId,
      },
    });
  });

  if (queriesFinished) {
    await Promise.all(
      foundPost.mediaUrl.map((key: string) => {
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env["AWS_BUCKET_NAME"],
            Key: key,
          }),
        );
      }),
    );
  }
};

export default {
  createPostService,
  getPostService,
  getAllPosts,
  getAllCommunityPostsService,
  getAllPostsFollowedService,
  editPostService,
  setPostReactionService,
  setFavoritePostService,
  deletePostService,
};
