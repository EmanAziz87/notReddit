import { useState } from "react";

const CommentForm = ({
  handleCommentSubmit,
  isParentComment,
  parentId,
  setActiveReplyInput,
}: {
  handleCommentSubmit: (
    e: React.SubmitEvent<HTMLFormElement>,
    content: string,
    isParent: boolean,
    parentId: number | null,
  ) => void;
  isParentComment: boolean;
  parentId: number | null;
  setActiveReplyInput:
    | ((value: React.SetStateAction<number | null>) => void)
    | null;
}) => {
  const [content, setContent] = useState<string>("");
  return (
    <form
      onSubmit={(e) => {
        setContent("");
        if (setActiveReplyInput) setActiveReplyInput(null);
        return handleCommentSubmit(e, content, isParentComment, parentId);
      }}
    >
      <div>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          type="text"
        />
      </div>

      <button type="submit">Comment</button>
    </form>
  );
};

export default CommentForm;
