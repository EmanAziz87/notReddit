import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CachedPost, ReactionMutation } from "../types";
import postService from "../api/postService";
import { useRef } from "react";
import type { PostsWithRelationsNoComments } from "backend";

export const useSetPostReaction = (
  communityId: string | undefined,
  postId: string | undefined,
) => {
  const queryClient = useQueryClient();

  const applyOptimisticUpdate = (reaction: "LIKE" | "DISLIKE" | "NONE") => {
    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
    const communityPostsCache = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["communityPosts", communityId]);
    const postFromCommunityCache = communityPostsCache?.find(
      (post) => String(post.id) === postId,
    );

    if (!cached && !postFromCommunityCache) return;

    let likes = cached?.fetchedPost.likes || postFromCommunityCache?.likes || 0;
    const prevReaction =
      cached?.fetchedPost.userReaction || postFromCommunityCache?.userReaction;

    if (reaction === "LIKE") {
      if (prevReaction === "disliked") likes += 1;
      else if (prevReaction !== "liked") likes += 1;
    } else if (reaction === "DISLIKE") {
      if (prevReaction === "liked") likes -= 1;
      else if (prevReaction !== "disliked") likes -= 1;
    } else if (reaction === "NONE") {
      if (prevReaction === "liked") likes -= 1;
      if (prevReaction === "disliked") likes += 1;
    }

    if (cached) {
      queryClient.setQueryData(["post", postId], {
        fetchedPost: {
          ...cached.fetchedPost,
          likes,
          userReaction:
            reaction === "NONE"
              ? null
              : reaction === "LIKE" && prevReaction === "disliked"
                ? null
                : reaction === "DISLIKE" && prevReaction === "liked"
                  ? null
                  : reaction === "LIKE"
                    ? "liked"
                    : "disliked",
        },
      });
    }

    if (postFromCommunityCache) {
      queryClient.setQueryData(
        ["communityPosts", communityId],
        communityPostsCache?.map((post) => {
          if (String(post.id) === postId) {
            return {
              ...post,
              likes,
              userReaction:
                reaction === "NONE"
                  ? null
                  : reaction === "LIKE" && prevReaction === "disliked"
                    ? null
                    : reaction === "DISLIKE" && prevReaction === "liked"
                      ? null
                      : reaction === "LIKE"
                        ? "liked"
                        : "disliked",
            };
          } else {
            return post;
          }
        }),
      );
    }

    const check = queryClient.getQueryData<PostsWithRelationsNoComments[]>([
      "communityPosts",
      communityId,
    ])?.[0];
    console.log("communityPosts cache: ", check?.userReaction);
  };

  const setReactionMutation = useMutation({
    mutationFn: async (vars: ReactionMutation) => {
      await postService.setReaction(
        vars.communityId,
        vars.postId,
        vars.reaction,
      );
    },
    onMutate: async () => {
      const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
      return { previousPost: cached };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReaction = (reaction: "LIKE" | "DISLIKE") => {
    console.log("applying reaction: ", reaction);

    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);

    const communityPostsCache = queryClient.getQueryData<
      PostsWithRelationsNoComments[]
    >(["communityPosts", communityId]);

    let current;

    if (cached) {
      current = cached?.fetchedPost.userReaction;
    } else if (communityPostsCache) {
      current = communityPostsCache?.find(
        (post) => String(post.id) === postId,
      )?.userReaction;
    }

    const nextReaction =
      (reaction === "LIKE" && current === "liked") ||
      (reaction === "DISLIKE" && current === "disliked")
        ? "NONE"
        : reaction;

    applyOptimisticUpdate(nextReaction);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);

      const finalCachedCommunityPost = queryClient
        .getQueryData<
          PostsWithRelationsNoComments[]
        >(["communityPosts", communityId])
        ?.find((post) => String(post.id) === postId);

      const finalReaction =
        finalCached?.fetchedPost.userReaction ||
        finalCachedCommunityPost?.userReaction;
      setReactionMutation.mutate({
        communityId: communityId!,
        postId: postId!,
        reaction:
          finalReaction === "liked"
            ? "LIKE"
            : finalReaction === "disliked"
              ? "DISLIKE"
              : "NONE",
      });
    }, 300);
  };

  const handleLike = () => handleReaction("LIKE");
  const handleDislike = () => handleReaction("DISLIKE");

  return { handleLike, handleDislike };
};
