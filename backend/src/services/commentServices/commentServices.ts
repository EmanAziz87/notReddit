import { buildCommentTree } from "../../lib/nestCommentsHelper";
import prisma from "../../lib/prisma";
import {
  isCommentOwnerOrThrow,
  postFoundOrThrow,
} from "../../lib/prismaHelpers";
import type { CreateCommentInput } from "../../routes/commentRoutes/commentSchema";
import type { CommentWithRelations } from "./typesCommentServices";

const createCommentService = async (
  commentInput: CreateCommentInput,
  postId: number,
  userId: number,
): Promise<CommentWithRelations> => {
  postFoundOrThrow(postId);
  return prisma.comments.create({
    data: {
      content: commentInput.content,
      postId: postId,
      authorId: userId,
    },
    include: {
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

const replyCommentService = async (
  postId: number,
  parentId: number,
  commentInput: CreateCommentInput,
  userId: number,
): Promise<CommentWithRelations> => {
  postFoundOrThrow(postId);
  return prisma.comments.create({
    data: {
      postId: postId,
      parentId: parentId,
      content: commentInput.content,
      authorId: userId,
    },
    include: {
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

const getAllCommentsForPostService = async (
  postId: number,
  userId: number | undefined,
) => {
  await postFoundOrThrow(postId);
  const commentReactionsArr: {
    commentId: number;
    userReaction: "liked" | "disliked" | null;
  }[] = [];
  if (userId) {
    const commentsLiked = await prisma.commentReaction.findMany({
      where: {
        userId: userId,
        comment: {
          postId,
        },
      },
    });

    commentsLiked.forEach((comment) => {
      let userReaction: "liked" | "disliked" | null = null;
      const obj = { commentId: comment.commentId };

      if (comment.type === "LIKE") {
        userReaction = "liked";
      }

      if (comment.type === "DISLIKE") {
        userReaction = "disliked";
      }

      commentReactionsArr.push({ ...obj, userReaction });
    });
  }
  const allComments = await prisma.comments.findMany({
    where: {
      postId: postId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          admin: true,
        },
      },
    },
  });

  return buildCommentTree(allComments, commentReactionsArr);
};

const editCommentService = async (
  postId: number,
  commentId: number,
  commentInput: CreateCommentInput,
  userId: number,
): Promise<CommentWithRelations> => {
  await postFoundOrThrow(postId);

  return prisma.comments.update({
    where: {
      id: commentId,
      authorId: userId,
    },
    data: {
      content: commentInput.content,
    },
    include: {
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

const deleteCommentService = async (
  postId: number,
  commentId: number,
  userId: number,
): Promise<void> => {
  await postFoundOrThrow(postId);
  await isCommentOwnerOrThrow(commentId, userId);

  await prisma.comments.delete({
    where: {
      id: commentId,
      authorId: userId,
    },
  });
};

const setCommentReactionService = async (
  postId: number,
  commentId: number,
  userId: number,
  reaction: "LIKE" | "DISLIKE" | "NONE",
) => {
  postFoundOrThrow(postId);

  console.log("set reaction service for comment. reaction: ", reaction);

  if (reaction === "NONE") {
    await prisma.commentReaction.deleteMany({
      where: { userId: userId, commentId },
    });
  } else {
    await prisma.commentReaction.upsert({
      where: { userId_commentId: { userId: userId, commentId } },
      create: { userId: userId, commentId, type: reaction },
      update: { type: reaction },
    });
  }

  const likeCount = await prisma.commentReaction.count({
    where: { commentId, type: "LIKE" },
  });
  const dislikeCount = await prisma.commentReaction.count({
    where: { commentId, type: "DISLIKE" },
  });

  return prisma.comments.update({
    where: { id: commentId },
    data: { likes: likeCount - dislikeCount },
  });
};

const getLikedComments = async (userId: number) => {
  return prisma.commentReaction.findMany({
    where: {
      userId,
      type: "LIKE",
    },
    include: {
      comment: true,
    },
  });
};

export default {
  createCommentService,
  replyCommentService,
  getAllCommentsForPostService,
  editCommentService,
  deleteCommentService,
  setCommentReactionService,
  getLikedComments,
};
