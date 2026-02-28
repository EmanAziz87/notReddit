import { useQuery } from "@tanstack/react-query";
import type { CachedPost } from "../types";
import postService from "../api/postService";

export const useGetPost = (
  communityId: string | undefined,
  postId: string | undefined,
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async (): Promise<CachedPost> => {
      const response = await postService.fetchPost(communityId!, postId!);
      console.log("FETCHED POST: ", response.fetchedPost);
      return { fetchedPost: response.fetchedPost };
    },
  });

  return { data, isLoading, error };
};
