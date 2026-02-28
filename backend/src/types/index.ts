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

export type PostsWithRelations = Prisma.PostsGetPayload<{
  include: {
    community: true;
    comments: true;
    author: { select: { id: true; username: true; admin: true } };
  };
}>;

export type PostsWithExtraData = PostsWithRelations & {
  userReaction: "liked" | "disliked" | null;
  favorited: boolean;
};
