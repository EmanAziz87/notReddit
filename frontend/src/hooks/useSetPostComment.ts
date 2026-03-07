import { useMutation, useQueryClient } from "@tanstack/react-query";
import commentService from "../api/commentService";

export const useSetPostComment = (postId: string) => {
  const queryClient = useQueryClient();
  const setPostCommentMutation = useMutation({
    mutationFn: async ({
      content,
      isParent,
      parentId,
    }: {
      content: string;
      isParent: boolean;
      parentId: number | null;
    }) => {
      if (isParent || !parentId) {
        await commentService.createCommentService(postId!, content);
      } else {
        await commentService.replyCommentService(postId!, content, parentId);
      }
    },
    onMutate: async () => {
      const previousComments = queryClient.getQueryData(["comments", postId]);
      return { previousComments };
    },
    onError: async (_error, _variables, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousComments);
      console.error(
        "error occured in setPostCommentMutation, rolling back changes on comments",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleCommentSubmit = (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => {
    e.preventDefault();

    setPostCommentMutation.mutate({ content, isParent, parentId });
  };

  return { handleCommentSubmit };
};
