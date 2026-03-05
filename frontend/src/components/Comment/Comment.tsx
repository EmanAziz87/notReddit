import { useState } from "react";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../CommentForm/CommentForm";
import style from "./Comment.module.css";
import { useSetCommentReaction } from "../../hooks/useSetCommentReaction";

const Comment = ({
  comment,
  handleCommentSubmit,
  postId,
  communityId,
}: {
  comment: CommentsWithReplies;
  handleCommentSubmit: (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => void;
  postId: string;
  communityId: string;
}) => {
  const [activeReplyInputId, setActiveReplyInputId] = useState<number | null>(
    null,
  );

  const { handleCommentLike, handleCommentDislike } = useSetCommentReaction(
    communityId,
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
              communityId={communityId}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Comment;
