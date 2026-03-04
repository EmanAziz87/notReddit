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

  // convert the below logic to comment reaction. change commentReact find unique to find many.
  // find many of the comment reactions and pass it into the build comment tree function.
  // In the function, attach userReaction to each comment based on whether the commentId for each
  // returned commentReaction matches the nestedComments comment.

  // on the frontend, copy the useSetPostReactionMutation to use for comments. obviously make adjustments
  // to account for the fact that we are working with nested arrays here, so mutation are going to be a little
  // bit more complicated. In the future we will think about sharing a function for setting both post likes and
  // comment likes.

  // const postLikedAlready = await prisma.postReaction.findUnique({
  //   where: {
  //     userId_postId: {
  //       userId: userId,
  //       postId: postId,
  //     },
  //   },
  // });

  // let userReaction: "liked" | "disliked" | null = null;
  // let favorited: boolean = true;

  // if (postLikedAlready?.type === "LIKE") {
  //   userReaction = "liked";
  // }

  // if (postLikedAlready?.type === "DISLIKE") {
  //   userReaction = "disliked";
  // }

  // if (!postFavoritedAlready) {
  //   favorited = false;
  // }

  // return {
  //   ...foundPost,
  //   userReaction: userReaction,
  //   favorited,
  // };

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
