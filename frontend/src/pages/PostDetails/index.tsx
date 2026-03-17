import { useNavigate, useParams } from "react-router";
import { useGetPost } from "../../hooks/useGetPost";
import Comment from "../../components/Comment/Comment";
import type { CommentsWithReplies, PostDeleteMutation } from "../../types";
import CommentForm from "../../components/CommentForm/CommentForm";
import { useGetPostComments } from "../../hooks/useGetPostComments";
import { useSetPostComment } from "../../hooks/useSetPostComment";
import { useGetCurrentUser } from "../../hooks/useGetCurrentUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "../../api/postService";
import type { PostsWithExtraData } from "backend";
import { useEffect, useState } from "react";
import PostReactionArrows from "../../components/PostReaction/PostReactionArrows";

const PostDetails = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [revealEdit, setRevealEdit] = useState<boolean>(false);
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useGetPost(communityId, postId);

  const [content, setContent] = useState<string>(
    postData?.fetchedPost.content ?? "",
  );

  useEffect(() => {
    if (postData?.fetchedPost.content) {
      setContent(postData.fetchedPost.content);
    }
  }, [postData]);

  const { currentUser, userLoading } = useGetCurrentUser();

  const {
    data: nestedComments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useGetPostComments(postId!);

  const { handleCommentSubmit } = useSetPostComment(postId!);

  const editPostMutation = useMutation({
    mutationFn: async (content: string) =>
      await postService.editPost(communityId!, postId!, content),

    onError: () => {
      console.error("error editing post");
    },
    onSettled: () => {
      setRevealEdit(false);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

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

  const handleEditPost = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = e.target["edit-content-input"].value;
    console.log(content);
    editPostMutation.mutate(content);
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
        {revealEdit ? (
          <form onSubmit={(e) => handleEditPost(e)}>
            <input
              type="textarea"
              value={content}
              name="edit-content-input"
              onChange={(e) => setContent(e.currentTarget.value)}
            />
            <button type="submit">Confirm Edit</button>
          </form>
        ) : (
          <div>{postData.fetchedPost.content}</div>
        )}
        <PostReactionArrows
          communityId={communityId!}
          postId={postId!}
          postFavorited={postData.fetchedPost.favorited}
          postLikes={postData.fetchedPost.likes}
        />
        {postData.fetchedPost.authorId === currentUser?.id && (
          <div>
            <button onClick={handleDeletePost}>Delete</button>
            <button onClick={() => setRevealEdit(!revealEdit)}>
              {revealEdit ? "Cancel" : "Edit"}
            </button>
          </div>
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
