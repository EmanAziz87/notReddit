import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CachedPost, ReactionMutation } from "../types";
import postService from "../api/postService";
import { useRef } from "react";

export const useSetPostReaction = (
  communityId: string | undefined,
  postId: string | undefined,
) => {
  const queryClient = useQueryClient();

  const applyOptimisticUpdate = (reaction: "LIKE" | "DISLIKE" | "NONE") => {
    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
    if (!cached) return;

    let likes = cached.fetchedPost.likes;
    const prevReaction = cached.fetchedPost.userReaction;

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
    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
    const current = cached?.fetchedPost.userReaction;
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
      const finalReaction = finalCached?.fetchedPost.userReaction;
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
