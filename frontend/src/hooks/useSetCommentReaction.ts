import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommentReactionMutation, CommentsWithReplies } from "../types";
import commentService from "../api/commentService";
import { useRef } from "react";

export const useSetCommentReaction = (
  commentId: number | undefined,
  postId: string | undefined,
) => {
  const queryClient = useQueryClient();

  const dfsForOptimisticUpdate = (
    nestedComments: CommentsWithReplies[],
    reaction: "LIKE" | "DISLIKE",
    commentId: number,
  ): CommentsWithReplies[] => {
    return nestedComments.map((comment) => {
      if (comment.id === commentId) {
        const current = comment.userReaction;
        const nextReaction =
          (reaction === "LIKE" && current === "liked") ||
          (reaction === "DISLIKE" && current === "disliked")
            ? "NONE"
            : reaction;
        console.log("likes before", comment.likes);
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
        console.log("likes after", likes);
        console.log("comment before reaction: ", comment);

        return {
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
      }
      return {
        ...comment,
        replies: dfsForOptimisticUpdate(comment.replies, reaction, commentId),
      };
    });
  };

  const dfsFindComment = (
    nestedComments: CommentsWithReplies[],
    commentId: number,
  ): CommentsWithReplies | null => {
    for (let i = 0; i < nestedComments.length; i++) {
      if (nestedComments[i].id === commentId) return nestedComments[i];

      dfsFindComment(nestedComments[i].replies, commentId);
    }
    return null;
  };

  const setCommentReactionMutation = useMutation({
    mutationFn: async (vars: CommentReactionMutation) => {
      await commentService.setCommentReactionService(
        vars.commentId,
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
    console.log("entered handle reaction");
    const commentsCache = queryClient.getQueryData<CommentsWithReplies[]>([
      "comments",
      postId,
    ]);

    const updatedComments = dfsForOptimisticUpdate(
      commentsCache!,
      reaction,
      commentId!,
    );
    queryClient.setQueryData(["comments", postId], [...updatedComments]);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalCachedComments = queryClient.getQueryData<
        CommentsWithReplies[]
      >(["comments", postId]);

      const finalUserReaction = dfsFindComment(
        finalCachedComments!,
        commentId!,
      )?.userReaction;

      console.log(
        "final cached comments before api call: ",
        finalCachedComments,
      );
      console.log("final user reaction: ", finalUserReaction);

      setCommentReactionMutation.mutate({
        commentId: commentId!,
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
