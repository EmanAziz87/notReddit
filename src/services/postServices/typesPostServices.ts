import type { Prisma } from "../../../generated/prisma/client";

export type PostsWithRelations = Prisma.PostsGetPayload<{
  include: {
    community: true;
    comments: true;
    author: { select: { id: true; username: true; admin: true } };
  };
}>;
