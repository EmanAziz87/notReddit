import { api } from "./axios";

const fetchAllPosts = async () => {
  const response = await api.get(`/posts`);
  return response.data;
};

const fetchPost = async (communityId: string, postId: string) => {
  const response = await api.get(
    `/posts/community/${communityId}/post/${postId}`,
  );
  return response.data;
};

const likePost = async (communityId: string, postId: string) => {
  const response = await api.put(
    `/posts/community/${communityId}/post/${postId}/like`,
  );
  return response.data;
};

export default { fetchAllPosts, fetchPost, likePost };
