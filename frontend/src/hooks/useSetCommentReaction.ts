import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommentsWithReplies, ReactionMutation } from "../types";
import commentService from "../api/commentService";
import { useRef } from "react";

export const useSetCommentReaction = (
  communityId: string | undefined,
  postId: string | undefined,
) => {
  const queryClient = useQueryClient();

  const applyOptimisticUpdate = (
    comment: CommentsWithReplies,
    reaction: "LIKE" | "DISLIKE",
  ): CommentsWithReplies => {
    const current = comment.userReaction;
    const nextReaction =
      (reaction === "LIKE" && current === "liked") ||
      (reaction === "DISLIKE" && current === "disliked")
        ? "NONE"
        : reaction;
    let likes = comment.likes;
    const prevReaction = comment.userReaction;

    if (nextReaction === "LIKE") {
      if (prevReaction === "disliked") likes += 1;
      else if (prevReaction !== "liked") likes += 1;
    } else if (nextReaction === "DISLIKE") {
      if (prevReaction === "liked") likes -= 1;
      else if (prevReaction !== "disliked") likes -= 1;
    } else if (nextReaction === "NONE") {
      if (prevReaction === "liked") likes -= 1;
      if (prevReaction === "disliked") likes += 1;
    }

    const commentWithNewReaction: CommentsWithReplies = {
      ...comment,
      likes,
      userReaction:
        nextReaction === "NONE"
          ? null
          : nextReaction === "LIKE" && prevReaction === "disliked"
            ? null
            : nextReaction === "DISLIKE" && prevReaction === "liked"
              ? null
              : nextReaction === "LIKE"
                ? "liked"
                : "disliked",
    };

    return commentWithNewReaction;
  };

  const dfsForOptimisticUpdate = (
    nestedComments: CommentsWithReplies[],
    reaction: "LIKE" | "DISLIKE",
    commentId: string,
  ): CommentsWithReplies[] => {
    for (let i = 0; i < nestedComments.length; i++) {
      if (i + 1 === nestedComments.length) continue;

      if (nestedComments[i].id === Number(commentId)) {
        nestedComments[i] = applyOptimisticUpdate(nestedComments[i], reaction);
        break;
      }

      dfsForOptimisticUpdate(nestedComments[i].replies, reaction, commentId);
    }
    return nestedComments;
  };

  const dfsFindComment = (
    nestedComments: CommentsWithReplies[],
    commentId: string,
  ): CommentsWithReplies | null => {
    for (let i = 0; i < nestedComments.length; i++) {
      if (i + 1 === nestedComments.length) continue;

      if (nestedComments[i].id === Number(commentId)) return nestedComments[i];

      dfsFindComment(nestedComments[i].replies, commentId);
    }
    return null;
  };

  const setCommentReactionMutation = useMutation({
    mutationFn: async (vars: ReactionMutation) => {
      await commentService.setCommentReactionService(
        vars.communityId,
        vars.postId,
        vars.reaction,
      );
    },
    onMutate: async () => {
      const cachedComments = queryClient.getQueryData<CommentsWithReplies>([
        "comments",
        postId,
      ]);
      return cachedComments;
    },
    onError: (_err, _variables, cachedComments) => {
      queryClient.setQueryData(["comments", postId], cachedComments);
    },
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReaction = (reaction: "LIKE" | "DISLIKE") => {
    const commentsCache = queryClient.getQueryData<CommentsWithReplies[]>([
      "comments",
      postId,
    ]);

    const updatedComments = dfsForOptimisticUpdate(
      commentsCache!,
      reaction,
      communityId!,
    );
    queryClient.setQueryData(["comments", postId], updatedComments);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalCachedComments = queryClient.getQueryData<
        CommentsWithReplies[]
      >(["post", postId]);
      const finalUserReaction = dfsFindComment(
        finalCachedComments!,
        communityId!,
      )?.userReaction;
      setCommentReactionMutation.mutate({
        communityId: communityId!,
        postId: postId!,
        reaction:
          finalUserReaction === "liked"
            ? "LIKE"
            : finalUserReaction === "disliked"
              ? "DISLIKE"
              : "NONE",
      });
    }, 300);
  };

  const handleCommentLike = () => handleReaction("LIKE");
  const handleCommentDislike = () => handleReaction("DISLIKE");

  return { handleCommentLike, handleCommentDislike };
};
Comment;
