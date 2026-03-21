import { useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "../api/postService";
import type { CachedPost } from "../types";
import { useRef } from "react";
import type { PostsWithExtraData, PostsWithRelationsNoComments } from "backend";

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
    let homefeedPostsCache = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["allPosts"]);

    if (!cache && !communityPostCache && !homefeedPostsCache) return;

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

    if (homefeedPostsCache) {
      queryClient.setQueryData(
        ["allPosts"],
        homefeedPostsCache.map((post) => {
          if (String(post.id) === postId) {
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

    let homefeedPostsCache = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["allPosts"]);

    const currentCache:
      | PostsWithExtraData
      | PostsWithRelationsNoComments
      | undefined = cachedPost
      ? cachedPost.fetchedPost
      : communityCachedPosts
        ? communityCachedPosts?.find((post) => String(post.id) === postId)
        : (homefeedPostsCache?.find((post) => String(post.id) === postId) ??
          undefined);

    if (!currentCache)
      return console.error("Like/Dislike error with currentCache ternary");

    const nextFavoritedState: boolean = !currentCache.favorited;

    console.log("Next favoritedState: ", nextFavoritedState);

    applyOptimisticUpdate(nextFavoritedState);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      let favoritedFinal: boolean;
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ])?.fetchedPost;
      const finalCommunityPostsCache = queryClient.getQueryData<
        PostsWithRelationsNoComments[]
      >(["communityPosts", communityId]);

      let finalHomefeedPostsCache = queryClient.getQueryData<
        PostsWithRelationsNoComments[]
      >(["allPosts"]);

      favoritedFinal = finalCached
        ? finalCached.favorited
        : finalCommunityPostsCache
          ? (finalCommunityPostsCache.find((post) => String(post.id) === postId)
              ?.favorited ?? false)
          : (finalHomefeedPostsCache?.find((post) => String(post.id) === postId)
              ?.favorited ?? false);

      setFavoriteMutation.mutate(favoritedFinal);
    }, 300);
  };

  return { handleFavorite };
};
