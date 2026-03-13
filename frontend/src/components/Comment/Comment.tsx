import { useState } from "react";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../CommentForm/CommentForm";
import style from "./Comment.module.css";
import { useSetCommentReaction } from "../../hooks/useSetCommentReaction";
import { useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "backend";
import { useDeleteComment } from "../../hooks/useDeleteComment";
import { useEditComment } from "../../hooks/useEditComment";

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

  const [commentContent, setCommentContent] = useState<string>(comment.content);

  const [activeReplyInputId, setActiveReplyInputId] = useState<number | null>(
    null,
  );

  const { handleCommentLike, handleCommentDislike } = useSetCommentReaction(
    comment.id,
    postId,
  );

  const { handleDeleteComment } = useDeleteComment(postId, String(comment.id));

  const { handleEditComment, revealEdit, setRevealEdit } = useEditComment(
    postId,
    String(comment.id),
  );

  const handleShowDeleteButton = () => {
    const user = queryClient.getQueryData<UserSession>(["me"]);
    return comment.authorId === user?.id ? (
      <button onClick={handleDeleteComment}>Delete</button>
    ) : null;
  };

  const handleShowEditButton = () => {
    const user = queryClient.getQueryData<UserSession>(["me"]);
    return comment.authorId === user?.id ? (
      <button onClick={() => setRevealEdit(!revealEdit)}>
        {revealEdit ? `Cancel` : `Edit`}
      </button>
    ) : null;
  };

  return (
    <div>
      <div>{comment.author.username}</div>
      <div>{!revealEdit ? comment.content : null}</div>
      {revealEdit ? (
        <form onSubmit={handleEditComment}>
          <input
            type="textarea"
            name="edit-comment-content-input"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button type="submit">Confirm</button>
        </form>
      ) : null}
      {loggedIn && (
        <button onClick={() => setActiveReplyInputId(comment.id)}>Reply</button>
      )}
      {handleShowDeleteButton()}
      {handleShowEditButton()}
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
