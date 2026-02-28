import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  Prisma,
  ReactionType,
  type Posts,
} from "../../../generated/prisma/client";
import { InvalidRequestError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import {
  communityFoundOrThrow,
  isPostOwnerOrThrow,
  postDislikedAlreadyOrThrow,
  postFavoritedAlreadyOrThrow,
  postFoundInCommunityOrThrow,
  postFoundOrThrow,
  postLikedAlreadyOrThrow,
  postMadeByUserOrThrow,
} from "../../lib/prismaHelpers";
import type { CreatePostInput } from "../../routes/postRoutes/postSchema";
import type { UserNoSensitiveInfo } from "../../types/express-session";
import s3Client from "../../util/s3client";
import type {
  FavoritedPostWithRelations,
  FollowedCommunitiesWithRelations,
} from "./typesPostServices";
import type {
  LikedPostsWithRelations,
  PostsWithExtraData,
  PostsWithRelations,
} from "../../types";

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

const getAllPosts = async (): Promise<Array<Posts>> => {
  return prisma.posts.findMany();
};

const getPostService = async (
  communityId: number,
  postId: number,
  userId: number,
): Promise<PostsWithExtraData> => {
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);

  const postLikedAlready = await prisma.postReaction.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (postLikedAlready?.type === "LIKE") {
    return {
      ...foundPost,
      userReaction: "liked",
    };
  }

  if (postLikedAlready?.type === "DISLIKE") {
    console.log("DISLIKED ALREADY: TRUE");
    return {
      ...foundPost,
      userReaction: "disliked",
    };
  }

  const foundPostNull = {
    ...foundPost,
    userReaction: null,
  };

  return foundPostNull;
};

const getAllCommunityPostsService = async (
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

const unlikePostService = async (
  communityId: number,
  postId: number,
  userId: number,
): Promise<PostsWithRelations> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);
  await postDislikedAlreadyOrThrow(postId, userIdNumber);

  return prisma.$transaction(async (tx) => {
    const postReactionExists = await tx.postReaction.findUnique({
      where: {
        userId_postId: {
          userId: userIdNumber,
          postId: postId,
        },
      },
    });

    if (!postReactionExists) {
      await tx.postReaction.create({
        data: {
          userId: userIdNumber,
          postId,
          type: ReactionType.DISLIKE,
        },
      });
    } else {
      await tx.postReaction.delete({
        where: {
          userId_postId: {
            postId,
            userId: userIdNumber,
          },
        },
      });
    }

    return await tx.posts.update({
      where: { id: postId },
      data: {
        likes: { decrement: 1 },
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
  });
};

const favoritePostService = async (
  communityId: number,
  postId: number,
  userId: number,
): Promise<FavoritedPostWithRelations> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);
  await postFavoritedAlreadyOrThrow(postId, userIdNumber);

  return prisma.$transaction(async (tx) => {
    return await tx.favoritedPosts.create({
      data: {
        postId: postId,
        userId: userIdNumber,
      },
      include: {
        post: true,
        user: {
          select: {
            id: true,
            username: true,
            admin: true,
          },
        },
      },
    });
  });
};

const unfavoritePostService = async (
  communityId: number,
  postId: number,
  userId: number,
): Promise<void> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);
  const foundPost = await postFoundOrThrow(postId);
  await postFoundInCommunityOrThrow(foundCommunity, foundPost);

  await prisma.favoritedPosts.delete({
    where: {
      userId_postId: {
        postId: postId,
        userId: userIdNumber,
      },
    },
  });
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
  unlikePostService,
  favoritePostService,
  unfavoritePostService,
  deletePostService,
};
