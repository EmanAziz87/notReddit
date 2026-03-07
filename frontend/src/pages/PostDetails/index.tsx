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
import { useGetCurrentUser } from "../../hooks/useGetCurrentUser";

const PostDetails = () => {
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const { currentUser, userLoading } = useGetCurrentUser();

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

  const deletePostMutation = useMutation({
    mutationFn: async (postDeleteObj: PostDeleteMutation) =>
      await postService.deletePost(
        postDeleteObj.communityId,
        postDeleteObj.postId,
      ),
    onMutate: () => {
      const previousPost = queryClient.getQueryData<PostsWithExtraData>([
        "post",
        postId,
      ]);
      return previousPost;
    },
    onError: (_error, _variables, previousPost) => {
      queryClient.setQueryData(["post", postId], previousPost);
      console.error("error deleting post, rolling back changes");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      navigate("/");
    },
  });

  const handleDeletePost = () => {
    deletePostMutation.mutate({ communityId: communityId!, postId: postId! });
  };

  if (postLoading && commentsLoading && userLoading)
    return <div>Loading...</div>;
  if (postError && commentsError)
    return (
      <div>
        Post Error: {postError.message}, Comments Error: {commentsError.message}
      </div>
    );

  if (!postData || !nestedComments) return null;

  const loggedIn = currentUser ? true : false;
  console.log("loggedIn value:", loggedIn, "currentUser:", currentUser);

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
              onClick={() => (loggedIn ? handleLike() : undefined)}
              className={`icon ${style["like-icon"]}`}
              style={loggedIn ? { cursor: "pointer" } : undefined}
            />
          </div>
          <div>{postData.fetchedPost.likes}</div>
          <div>
            <span
              onClick={() => (loggedIn ? handleDislike() : undefined)}
              className={`icon ${style["dislike-icon"]}`}
              style={loggedIn ? { cursor: "pointer" } : undefined}
            />
          </div>
          <div>
            <span
              onClick={() => (loggedIn ? handleFavorite() : undefined)}
              className={`icon ${style["favorite-icon"]}`}
              style={{
                color: postData.fetchedPost.favorited ? "red" : "black",
                ...(loggedIn ? { cursor: "pointer" } : {}),
              }}
            />
          </div>
        </div>
        {postData.fetchedPost.authorId === currentUser?.id && (
          <button onClick={handleDeletePost}>Delete</button>
        )}

        <div>
          <h3>comments</h3>
          {loggedIn && (
            <CommentForm
              handleCommentSubmit={handleCommentSubmit}
              isParentComment={true}
              parentId={null}
              setActiveReplyInput={null}
            />
          )}
          <div>
            {nestedComments.map((c: CommentsWithReplies) => (
              <div key={c.id}>
                <Comment
                  comment={c}
                  handleCommentSubmit={handleCommentSubmit}
                  postId={postId!}
                  loggedIn={loggedIn}
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
