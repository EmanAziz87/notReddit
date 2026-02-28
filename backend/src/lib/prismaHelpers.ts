import {
  ReactionType,
  type Communities,
  type Conversations,
  type Posts,
  type Users,
} from "../../generated/prisma/client";
import type { PostsWithRelations } from "../types";
import { ConflictError, NotFoundError, UnauthorizedError } from "./appErrors";
import prisma from "./prisma";

export const communityFoundOrThrow = async (
  communityId: number,
): Promise<Communities> => {
  const foundCommunity = await prisma.communities.findUnique({
    where: {
      id: communityId,
    },
  });

  if (!foundCommunity) {
    throw new NotFoundError("That community was not found");
  }

  return foundCommunity;
};

export const postFoundOrThrow = async (
  postId: number,
): Promise<PostsWithRelations> => {
  const foundPost = await prisma.posts.findFirst({
    where: {
      id: postId,
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

  if (!foundPost) {
    throw new NotFoundError("That post was not found");
  }

  return foundPost;
};

export const postFoundInCommunityOrThrow = async (
  community: Communities,
  post: PostsWithRelations,
) => {
  const foundCommunity = await communityFoundOrThrow(community.id);

  if (foundCommunity.id !== post.communityId) {
    throw new NotFoundError("Post not found in this community");
  }

  return post;
};

export const postMadeByUserOrThrow = async (
  postId: number,
  userId: number,
): Promise<Posts> => {
  const foundUserMadePost = await prisma.posts.findFirst({
    where: {
      id: postId,
      authorId: userId,
    },
  });

  if (!foundUserMadePost) {
    throw new NotFoundError("The user did not create that post");
  }

  return foundUserMadePost;
};

export const postLikedAlreadyOrThrow = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const postLikedAlready = await prisma.postReaction.findFirst({
    where: {
      userId: userId,
      postId: postId,
      type: ReactionType.LIKE,
    },
  });

  if (postLikedAlready) {
    throw new ConflictError("The user already liked that post");
  }
};

export const postDislikedAlreadyOrThrow = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const postDislikedAlready = await prisma.postReaction.findFirst({
    where: {
      userId: userId,
      postId: postId,
      type: ReactionType.DISLIKE,
    },
  });

  if (postDislikedAlready) {
    throw new ConflictError("The user already disliked that post");
  }
};

export const postFavoritedAlreadyOrThrow = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const favoritedAlready = await prisma.favoritedPosts.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (favoritedAlready) {
    throw new ConflictError("Post already favorited");
  }
};

export const isPostOwnerOrThrow = async (
  post: PostsWithRelations,
  userId: number,
): Promise<void> => {
  if (post.authorId !== userId) {
    throw new UnauthorizedError(
      "You can't delete that if you are not the owner",
    );
  }
};

export const userExistsOrThrow = async (userId: number): Promise<Users> => {
  const foundUser = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!foundUser) {
    throw new NotFoundError("That user was not found");
  }

  return foundUser;
};

export const conversationExistsOrThrow = async (
  conversationId: number,
): Promise<Conversations> => {
  const foundConversation = await prisma.conversations.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!foundConversation) {
    throw new NotFoundError("That conversation was not found");
  }

  return foundConversation;
};

export const memberOfConversationOrThrow = async (
  conversationId: number,
  userId: number,
): Promise<void> => {
  const foundConversation = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: userId,
      },
    },
  });

  if (!foundConversation) {
    throw new NotFoundError("The user does not belong to that conversation");
  }
};
