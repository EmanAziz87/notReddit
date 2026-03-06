import type { Comments } from "../../generated/prisma/client";
import type { CommentsWithExtraData } from "../types";

export const buildCommentTree = (
  comments: Array<Comments>,
  commentReactionsArr: {
    commentId: number;
    userReaction: "liked" | "disliked" | null;
  }[],
): CommentsWithExtraData[] => {
  const map = new Map<number, any>();
  const roots: CommentsWithExtraData[] = [];

  comments.forEach((comment) => {
    map.set(comment.id, {
      ...comment,
      replies: [],
      userReaction:
        commentReactionsArr.find((c) => c.commentId === comment.id)
          ?.userReaction ?? null,
    });
  });

  map.forEach((comment) => {
    if (comment.parentId) {
      map.get(comment.parentId)?.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
};
