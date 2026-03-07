import { useQuery } from "@tanstack/react-query";
import commentService from "../api/commentService";

export const useGetPostComments = (postId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => commentService.fetchCommentsForPost(postId!),
  });

  return { data, isLoading, error };
};
