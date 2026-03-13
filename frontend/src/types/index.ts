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
  commentId: string;
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
  formData: FormData;
}

export interface EditCommentMutation {
  commentId: string;
  postId: string;
  content: string;
}
