import type { PostsWithExtraData } from "backend";

export interface ReactionMutation {
  communityId: string;
  postId: string;
  reaction: "LIKE" | "DISLIKE" | "NONE";
}

export interface CachedPost {
  fetchedPost: PostsWithExtraData;
}
