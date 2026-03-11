import type { PostsWithExtraData } from "backend";

export interface ReactionMutation {
  communityId: string;
  postId: string;
  reaction: "LIKE" | "DISLIKE" | "NONE";
}

export interface CommentReactionMutation {
  commentId: number;
  postId: string;
  reaction: "LIKE" | "DISLIKE" | "NONE";
}

export interface CommentDeleteMutation {
  commentId: number;
  postId: string;
}

export interface PostDeleteMutation {
  communityId: string;
  postId: string;
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
  userReaction: "liked" | "disliked" | null;
}

export interface loginData {
  username: string;
  password: string;
}

export interface PostCreateMutation {
  communityId: string;
  title: string;
  content: string;
  fileUploadData: FormData;
}
