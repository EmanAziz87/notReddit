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

const deleteCommentService = async (postId: string, commentId: string) => {
  await api.delete(`/comments/post/${postId}/${commentId}/delete`);
};

const editCommentService = async (
  postId: string,
  commentId: string,
  content: string,
) => {
  await api.put(`/comments/post/${postId}/${commentId}/edit`, { content });
};

const getLikedComments = async () => {
  const response = await api.get("/comments/liked");
  console.log(response.data);
  return response.data.likedComments;
};

export default {
  fetchCommentsForPost,
  createCommentService,
  replyCommentService,
  setCommentReactionService,
  deleteCommentService,
  editCommentService,
  getLikedComments,
};
