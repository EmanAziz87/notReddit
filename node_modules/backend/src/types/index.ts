import type {
  Comments,
  Posts,
  Prisma,
  Users,
} from "../../generated/prisma/client";

export type { Users, Posts, Comments };

export type LikedPostsWithRelations = Prisma.PostReactionGetPayload<{
  include: {
    post: true;
    user: { select: { id: true; username: true; admin: true } };
  };
}>;
