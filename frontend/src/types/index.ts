import type { PostsWithExtraData } from "backend";

export interface ReactionMutation {
  communityId: string;
  postId: string;
  reaction: "LIKE" | "DISLIKE" | "NONE";
}

export interface CachedPost {
  fetchedPost: PostsWithExtraData;
}

export interface CommentsWithReplies {
  id: number;
  content: string;
  likes: number;
  parentId: number | null;
  postId: number;
  authorId: number;
  author: {
    id: number;
    username: string;
    admin: boolean;
  };
  showReplyInput: boolean;
  replies: CommentsWithReplies[];
}
