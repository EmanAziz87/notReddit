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

// const likePost = async (communityId: string, postId: string) => {
//   const response = await api.put(
//     `/posts/community/${communityId}/post/${postId}/like`,
//   );
//   return response.data;
// };

// const dislikePost = async (communityId: string, postId: string) => {
//   const response = await api.put(
//     `/posts/community/${communityId}/post/${postId}/unlike`,
//   );
//   return response.data;
// };

export default { fetchAllPosts, fetchPost, setReaction, setFavorite };
