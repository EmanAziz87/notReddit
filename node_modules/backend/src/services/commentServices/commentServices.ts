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

const getAllCommentsForPostService = async (postId: number) => {
  postFoundOrThrow(postId);
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

  return buildCommentTree(allComments);
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

const likeCommentService = async (
  postId: number,
  commentId: number,
  userId: number,
) => {
  postFoundOrThrow(postId);

  const foundLikedComment = await prisma.commentReaction.findUnique({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });

  return await prisma.$transaction(async (tx) => {
    if (!foundLikedComment) {
      await tx.commentReaction.create({
        data: {
          userId: userId,
          commentId: commentId,
          type: "LIKE",
        },
      });
      return await tx.comments.update({
        where: {
          id: commentId,
        },
        data: {
          likes: { increment: 1 },
        },
      });
    } else if (foundLikedComment.type === "DISLIKE") {
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
          likes: { increment: 1 },
        },
      });
    } else {
      throw new ConflictError("Already liked that comment");
    }
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
  likeCommentService,
  dislikedCommentService,
};
