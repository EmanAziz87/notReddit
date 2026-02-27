import type { Prisma } from "../../../generated/prisma/client";

export type PostsWithRelations = Prisma.PostsGetPayload<{
  include: {
    community: true;
    comments: true;
    author: { select: { id: true; username: true; admin: true } };
  };
}>;

export type FollowedCommunitiesWithRelations =
  Prisma.FollowedCommunitiesGetPayload<{
    include: {
      community: {
        include: {
          posts: {
            include: { author: { select: { username: true; admin: true } } };
          };
        };
      };
    };
  }>;

export type LikedPostsWithRelations = Prisma.PostReactionGetPayload<{
  include: {
    post: true;
    user: { select: { id: true; username: true; admin: true } };
  };
}>;

export type FavoritedPostWithRelations = Prisma.FavoritedPostsGetPayload<{
  include: {
    post: true;
    user: { select: { id: true; username: true; admin: true } };
  };
}>;
