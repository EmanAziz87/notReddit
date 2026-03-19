import type { Prisma } from "../../../generated/prisma/client";

export type CommentWithRelations = Prisma.CommentsGetPayload<{
  include: { author: { select: { id: true; username: true; admin: true } } };
}>;

export type LikedCommentWithRelations = Prisma.CommentReactionGetPayload<{
  include: {
    comment: {
      include: {
        author: { select: { id: true; username: true; admin: true } };
      };
    };
  };
}>;
