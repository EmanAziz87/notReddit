import { useState } from "react";
import type { CommentDeleteMutation, CommentsWithReplies } from "../../types";
import CommentForm from "../CommentForm/CommentForm";
import style from "./Comment.module.css";
import { useSetCommentReaction } from "../../hooks/useSetCommentReaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "backend";
import commentService from "../../api/commentService";

const Comment = ({
  comment,
  handleCommentSubmit,
  postId,
  loggedIn,
}: {
  comment: CommentsWithReplies;
  handleCommentSubmit: (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => void;
  postId: string;
  loggedIn: boolean;
}) => {
  const queryClient = useQueryClient();

  const [activeReplyInputId, setActiveReplyInputId] = useState<number | null>(
    null,
  );

  const { handleCommentLike, handleCommentDislike } = useSetCommentReaction(
    comment.id,
    postId,
  );

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

  const handleShowDeleteButton = () => {
    const user = queryClient.getQueryData<UserSession>(["me"]);
    return comment.authorId === user?.id ? (
      <button onClick={handleDeleteComment}>Delete</button>
    ) : null;
  };

  const handleDeleteComment = () => {
    deleteCommentMutation.mutate({ postId, commentId: comment.id });
  };

  return (
    <div>
      <div>
        {comment.content} : {comment.author.username}
      </div>
      {loggedIn && (
        <button onClick={() => setActiveReplyInputId(comment.id)}>Reply</button>
      )}
      {handleShowDeleteButton()}
      <div className={style["comment-like-dislike-container"]}>
        <div>
          <span
            onClick={() => (loggedIn ? handleCommentLike() : undefined)}
            className={`icon ${style["comment-like-icon"]}`}
            style={{ ...(loggedIn ? { cursor: "pointer" } : {}) }}
          />
        </div>
        <div>{comment.likes}</div>
        <div>
          <span
            onClick={() => (loggedIn ? handleCommentDislike() : undefined)}
            className={`icon ${style["comment-dislike-icon"]}`}
            style={{ ...(loggedIn ? { cursor: "pointer" } : {}) }}
          />
        </div>
      </div>
      <div
        style={{
          display: activeReplyInputId === comment.id ? "block" : "none",
        }}
      >
        <CommentForm
          handleCommentSubmit={handleCommentSubmit}
          isParentComment={false}
          parentId={comment.id}
          setActiveReplyInput={setActiveReplyInputId}
        />
        <button type="button" onClick={() => setActiveReplyInputId(null)}>
          Cancel
        </button>
      </div>
      {comment.replies.map((c) => {
        return (
          <div key={c.id} style={{ marginLeft: "40px" }}>
            <Comment
              comment={c}
              handleCommentSubmit={handleCommentSubmit}
              postId={postId}
              loggedIn={loggedIn}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Comment;
