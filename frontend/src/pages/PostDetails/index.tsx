import { useParams } from "react-router";
import style from "./PostDetails.module.css";
import { useSetPostReaction } from "../../hooks/useSetPostReaction";
import { useGetPost } from "../../hooks/useGetPost";
import { useSetPostFavorite } from "../../hooks/useSetPostFavorite";
import Comment from "../../components/Comment/Comment";
import type { CommentsWithReplies } from "../../types";
import CommentForm from "../../components/CommentForm/CommentForm";
import { useGetPostComments } from "../../hooks/useGetPostComments";
import { useSetPostComment } from "../../hooks/useSetPostComment";

const PostDetails = () => {
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const {
    data: nestedComments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useGetPostComments(postId!);

  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useGetPost(communityId, postId);

  const { handleLike, handleDislike } = useSetPostReaction(communityId, postId);
  const { handleFavorite } = useSetPostFavorite(communityId, postId);
  const { handleCommentSubmit } = useSetPostComment(postId!);

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
        <div>{postData.fetchedPost.author.username}</div>
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
