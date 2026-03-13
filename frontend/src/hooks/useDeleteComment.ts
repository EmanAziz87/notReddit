import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommentDeleteMutation, CommentsWithReplies } from "../types";
import commentService from "../api/commentService";

export const useDeleteComment = (postId: string, commentId: string) => {
  const queryClient = useQueryClient();
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentDeleteObj: CommentDeleteMutation) => {
      await commentService.deleteCommentService(
        commentDeleteObj.postId,
        commentDeleteObj.commentId,
      );
    },
    onMutate: () => {
      const cachedComments = queryClient.getQueryData<CommentsWithReplies>([
        "comments",
        postId,
      ]);
      return cachedComments;
    },
    onError: (_error, _variables, cachedComments) => {
      queryClient.setQueryData(["comments", postId], cachedComments);
      console.log("error deleting comments, rolling back changes");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleDeleteComment = () => {
    deleteCommentMutation.mutate({ postId, commentId });
  };

  return { handleDeleteComment };
};
