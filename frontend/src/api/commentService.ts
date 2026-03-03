import { api } from "./axios";

const fetchCommentsForPost = async (postId: string) => {
  const response = await api.get(`/comments/post/${postId}`);
  console.log("RETURNED COMMENT TREE: ", response.data);
  return response.data;
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

export default {
  fetchCommentsForPost,
  createCommentService,
  replyCommentService,
};
