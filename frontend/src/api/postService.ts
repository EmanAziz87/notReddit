import { api } from "./axios";

const fetchAllPosts = async () => {
  const response = await api.get(`/posts`);
  return response.data.allFetchedPosts;
};

const fetchPost = async (communityId: string, postId: string) => {
  const response = await api.get(
    `/posts/community/${communityId}/post/${postId}`,
  );
  return response.data;
};

const fetchCommunityPosts = async (communityId: string) => {
  const response = await api.get(`/posts/community/${communityId}`);
  return response.data.communityPosts;
};

const setReaction = async (
  communityId: string,
  postId: string,
  reaction: "LIKE" | "DISLIKE" | "NONE",
) => {
  const response = await api.post(
    `/posts/community/${communityId}/post/${postId}/${reaction}/setReaction`,
  );
  return response.data;
};

const setFavorite = async (
  communityId: string,
  postId: string,
  favorite: boolean,
) => {
  await api.post(`/posts/community/${communityId}/post/${postId}/setFavorite`, {
    favorite,
  });
};

const deletePost = async (communityId: string, postId: string) =>
  await api.delete(`/posts/community/${communityId}/post/${postId}`);

const createPost = async (communityId: string, formData: FormData) => {
  await api.post(`/posts/community/${communityId}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const editPost = async (
  communityId: string,
  postId: string,
  content: string,
) => {
  await api.put(`/posts/community/${communityId}/post/${postId}`, { content });
};

const getLikedPosts = async () => {
  const response = await api.get("/posts/liked");
  return response.data.likedPosts;
};

const getFavoritedPosts = async () => {
  const response = await api.get("/posts/favorited");
  return response.data.favoritedPosts;
};

export default {
  fetchAllPosts,
  fetchPost,
  setReaction,
  setFavorite,
  deletePost,
  createPost,
  fetchCommunityPosts,
  editPost,
  getLikedPosts,
  getFavoritedPosts,
};
