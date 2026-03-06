import { ConflictError } from "../../lib/appErrors";
import { buildCommentTree } from "../../lib/nestCommentsHelper";
import prisma from "../../lib/prisma";
import { postFoundOrThrow } from "../../lib/prismaHelpers";
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

const getAllCommentsForPostService = async (postId: number, userId: number) => {
  await postFoundOrThrow(postId);
  // find difference between likes and dislikes and use that to update the new likes count for
  // each comment before returning the nesting the comments and returning them to the client.
  const commentsLiked = await prisma.commentReaction.findMany({
    where: {
      userId: userId,
      comment: {
        postId,
      },
    },
  });
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

  const commentReactionsArr: {
    commentId: number;
    userReaction: "liked" | "disliked" | null;
  }[] = [];

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

  return buildCommentTree(allComments, commentReactionsArr);
};

const editCommentService = async (
  postId: number,
  commentId: number,
  commentInput: CreateCommentInput,
  userId: number,
): Promise<CommentWithRelations> => {
  postFoundOrThrow(postId);

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
  postFoundOrThrow(postId);

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

const dislikedCommentService = async (
  postId: number,
  commentId: number,
  userId: number,
) => {
  postFoundOrThrow(postId);

  const foundCommentReaction = await prisma.commentReaction.findUnique({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });

  return await prisma.$transaction(async (tx) => {
    if (!foundCommentReaction) {
      await tx.commentReaction.create({
        data: {
          userId: userId,
          commentId: commentId,
          type: "DISLIKE",
        },
      });
      return await tx.comments.update({
        where: {
          id: commentId,
        },
        data: {
          likes: { decrement: 1 },
        },
      });
    } else if (foundCommentReaction.type === "LIKE") {
      await tx.commentReaction.delete({
        where: {
          userId_commentId: {
            userId: userId,
            commentId: commentId,
          },
        },
      });
      return await tx.comments.update({
        where: {
          id: commentId,
        },
        data: {
          likes: { decrement: 1 },
        },
      });
    } else {
      throw new ConflictError("Already disliked that comment");
    }
  });
};

export default {
  createCommentService,
  replyCommentService,
  getAllCommentsForPostService,
  editCommentService,
  deleteCommentService,
  setCommentReactionService,
  dislikedCommentService,
};
