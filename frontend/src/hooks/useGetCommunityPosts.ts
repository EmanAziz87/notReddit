import type { PostsWithRelationsNoComments } from "backend";
import postService from "../api/postService";
import { useQuery } from "@tanstack/react-query";

export const useGetCommunityPosts = (communityId: string) => {
  const {
    data: communityPostsData,
    isLoading: communityPostsLoading,
    error: communityPostsError,
  } = useQuery<PostsWithRelationsNoComments[]>({
    queryKey: ["communityPosts", communityId],
    queryFn: async () => await postService.fetchCommunityPosts(communityId!),
  });

  return { communityPostsData, communityPostsLoading, communityPostsError };
};
