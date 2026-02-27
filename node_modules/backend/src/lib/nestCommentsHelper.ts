import type { Comments } from "../../generated/prisma/client";

export const buildCommentTree = (comments: Array<Comments>) => {
  const map = new Map<number, any>();
  const roots: any[] = [];

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
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
