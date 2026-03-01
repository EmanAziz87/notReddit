import { useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "../api/postService";
import type { CachedPost } from "../types";
import { useRef } from "react";

export const useSetPostFavorite = (
  communityId: string | undefined,
  postId: string | undefined,
) => {
  const queryClient = useQueryClient();

  const setFavoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) =>
      await postService.setFavorite(communityId!, postId!, favorite),
    onMutate: async () => {
      const cached = queryClient.getQueryData(["post", postId]);

      return { previousPost: cached };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["post", postId], context?.previousPost);
      console.error(
        "error occured in setFavoriteMutation, rolling back changes on post",
      );
    },
  });

  const applyOptimisticUpdate = (favorite: boolean) => {
    const cache = queryClient.getQueryData<CachedPost>(["post", postId]);

    if (!cache) return;

    queryClient.setQueryData(["post", postId], {
      fetchedPost: {
        ...cache.fetchedPost,
        favorited: favorite,
      },
    });
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFavorite = () => {
    const cachedPost = queryClient.getQueryData<CachedPost>(["post", postId]);
    const nextFavoritedState: boolean = !cachedPost?.fetchedPost.favorited;

    applyOptimisticUpdate(nextFavoritedState);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);
      console.log(
        "firing API call with favorite:",
        finalCached?.fetchedPost.favorited,
      );

      setFavoriteMutation.mutate(finalCached?.fetchedPost.favorited ?? false);
    }, 300);
  };

  return { handleFavorite };
};
