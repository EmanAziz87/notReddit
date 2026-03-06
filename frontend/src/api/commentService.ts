import { api } from "./axios";

const fetchCommentsForPost = async (postId: string) => {
  const response = await api.get(`/comments/post/${postId}`);
  console.log("RETURNED COMMENT TREE: ", response.data);
  return response.data.nestedComments;
};

const createCommentService = async (postId: string, content: string) => {
  await api.post(`/comments/post/${postId}/create`, { content });
};

const replyCommentService = async (
  postId: string,
  content: string,
  parentId: number,
) => {
  await api.post(`/comments/post/${postId}/${parentId}/reply`, { content });
};

const setCommentReactionService = async (
  commentId: number,
  postId: string,
  reaction: "LIKE" | "DISLIKE" | "NONE",
) => {
  await api.post(
    `/comments/post/${postId}/${commentId}/${reaction}/setReaction`,
  );
};

export default {
  fetchCommentsForPost,
  createCommentService,
  replyCommentService,
  setCommentReactionService,
};
