import { useParams } from "react-router";
import style from "./PostDetails.module.css";
import { useSetPostReaction } from "../../hooks/useSetPostReaction";
import { useGetPost } from "../../hooks/useGetPost";
import { useSetPostFavorite } from "../../hooks/useSetPostFavorite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import commentService from "../../api/commentService";
import Comment from "../../components/Comment/Comment";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../../components/CommentForm/CommentForm";

const PostDetails = () => {
  const queryClient = useQueryClient();
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const {
    data: nestedComments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => commentService.fetchCommentsForPost(postId!),
  });

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

  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useGetPost(communityId, postId);

  const { handleLike, handleDislike } = useSetPostReaction(communityId, postId);

  const { handleFavorite } = useSetPostFavorite(communityId, postId);

  if (postLoading && commentsLoading) return <div>Loading...</div>;
  if (postError && commentsError)
    return (
      <div>
        Post Error: {postError.message}, Comments Error: {commentsError.message}
      </div>
    );

  if (!postData || !nestedComments) return null;

  return (
    <div>
      <div>
        <div>Post Details</div>
        <div>{postData.fetchedPost.title}</div>
        {postData.fetchedPost.mediaUrl[0] && (
          <img
            src={postData.fetchedPost.mediaUrl[0]}
            alt=""
            width={300}
            height={300}
          />
        )}
        <div>{postData.fetchedPost.content}</div>
        <div className={style["like-dislike-container"]}>
          <div>
            <span
              onClick={handleLike}
              className={`icon ${style["like-icon"]}`}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div>{postData.fetchedPost.likes}</div>
          <div>
            <span
              onClick={handleDislike}
              className={`icon ${style["dislike-icon"]}`}
            />
          </div>
          <div>
            <span
              onClick={handleFavorite}
              className={`icon ${style["favorite-icon"]}`}
              style={{
                color: postData.fetchedPost.favorited ? "red" : "black",
              }}
            />
          </div>
        </div>
        <div>
          <h3>comments</h3>
          <CommentForm
            handleCommentSubmit={handleCommentSubmit}
            isParentComment={true}
            parentId={null}
            setActiveReplyInput={null}
          />
          <div>
            {nestedComments.map((c: CommentsWithReplies) => (
              <div key={c.id}>
                <Comment
                  comment={c}
                  handleCommentSubmit={handleCommentSubmit}
                  postId={postId!}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default PostDetails;
