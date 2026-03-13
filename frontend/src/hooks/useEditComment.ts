import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditCommentMutation } from "../types";
import commentService from "../api/commentService";
import { useState } from "react";

export const useEditComment = (postId: string, commentId: string) => {
  const queryClient = useQueryClient();
  const [revealEdit, setRevealEdit] = useState<boolean>(false);
  const editCommentMutation = useMutation({
    mutationFn: async (editCommentObj: EditCommentMutation) => {
      await commentService.editCommentService(
        editCommentObj.postId,
        editCommentObj.commentId,
        editCommentObj.content,
      );
    },
    onError: () => {
      console.error("error editing comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleEditComment = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    editCommentMutation.mutate({
      commentId,
      postId,
      content: e.target["edit-comment-content-input"].value,
    });
    setRevealEdit(!revealEdit);
  };

  return { handleEditComment, revealEdit, setRevealEdit };
};
