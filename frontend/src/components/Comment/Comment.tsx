import { useState } from "react";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../CommentForm/CommentForm";
import style from "./Comment.module.css";
import { useSetCommentReaction } from "../../hooks/useSetCommentReaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "backend";

const Comment = ({
  comment,
  handleCommentSubmit,
  postId,
}: {
  comment: CommentsWithReplies;
  handleCommentSubmit: (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => void;
  postId: string;
}) => {
  const [activeReplyInputId, setActiveReplyInputId] = useState<number | null>(
    null,
  );

  const { handleCommentLike, handleCommentDislike } = useSetCommentReaction(
    comment.id,
    postId,
  );

  return (
    <div>
      <div>
        {comment.content} : {comment.author.username}
      </div>
      <button onClick={() => setActiveReplyInputId(comment.id)}>Reply</button>
      <div className={style["comment-like-dislike-container"]}>
        <div>
          <span
            onClick={handleCommentLike}
            className={`icon ${style["comment-like-icon"]}`}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div>{comment.likes}</div>
        <div>
          <span
            onClick={handleCommentDislike}
            className={`icon ${style["comment-dislike-icon"]}`}
            style={{ cursor: "pointer" }}
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
            />
          </div>
        );
      })}
    </div>
  );
};

export default Comment;
