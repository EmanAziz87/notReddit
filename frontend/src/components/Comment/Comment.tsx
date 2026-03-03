import { useState } from "react";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../CommentForm/CommentForm";

const Comment = ({
  comment,
  handleCommentSubmit,
}: {
  comment: CommentsWithReplies;
  handleCommentSubmit: (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => void;
}) => {
  const [activeReplyInputId, setActiveReplyInputId] = useState<number | null>(
    null,
  );

  return (
    <div>
      <div>
        {comment.content} : {comment.author.username}
      </div>
      <button onClick={() => setActiveReplyInputId(comment.id)}>Reply</button>
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
            <Comment comment={c} handleCommentSubmit={handleCommentSubmit} />
          </div>
        );
      })}
    </div>
  );
};

export default Comment;
