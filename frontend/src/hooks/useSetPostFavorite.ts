import { useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "../api/postService";
import type { CachedPost } from "../types";
import { useRef } from "react";
import type { PostsWithRelationsNoComments } from "backend";

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
    const communityPostCache = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["communityPosts", communityId]);

    if (!cache && !communityPostCache) return;

    if (cache) {
      queryClient.setQueryData(["post", postId], {
        fetchedPost: {
          ...cache.fetchedPost,
          favorited: favorite,
        },
      });
    }
    if (communityPostCache) {
      queryClient.setQueryData(
        ["communityPosts", communityId],
        communityPostCache!.map((post) => {
          if (postId === String(post.id)) {
            return { ...post, favorited: favorite };
          } else {
            return post;
          }
        }),
      );
    }
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFavorite = () => {
    let cachedPost = queryClient.getQueryData<CachedPost>(["post", postId]);
    let communityCachedPosts = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["communityPosts", communityId]);

    const nextFavoritedState: boolean = cachedPost
      ? !cachedPost?.fetchedPost.favorited
      : !(
          communityCachedPosts?.find((post) => String(post.id) === postId)
            ?.favorited ?? false
        );

    applyOptimisticUpdate(nextFavoritedState);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      let favoritedFinal: boolean | undefined;
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);

      if (!finalCached) {
        const communityPostsCache = queryClient.getQueryData<
          PostsWithRelationsNoComments[]
        >(["communityPosts", communityId]);

        favoritedFinal = communityPostsCache?.find(
          (post) => String(post.id) === postId,
        )?.favorited;
      }

      setFavoriteMutation.mutate(
        finalCached?.fetchedPost.favorited ?? favoritedFinal ?? false,
      );
    }, 300);
  };

  return { handleFavorite };
};
