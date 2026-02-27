import type { Prisma } from "../../../generated/prisma/client";

export type CommentWithRelations = Prisma.CommentsGetPayload<{
  include: { author: { select: { id: true; username: true; admin: true } } };
}>;
