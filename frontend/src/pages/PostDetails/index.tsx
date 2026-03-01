import { useParams } from "react-router";
import style from "./PostDetails.module.css";
import { useSetPostReaction } from "../../hooks/useSetPostReaction";
import { useGetPost } from "../../hooks/useGetPost";
import { useSetPostFavorite } from "../../hooks/useSetPostFavorite";

const PostDetails = () => {
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const { data, isLoading, error } = useGetPost(communityId, postId);

  const { handleLike, handleDislike } = useSetPostReaction(communityId, postId);

  const { handleFavorite } = useSetPostFavorite(communityId, postId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  const post = data?.fetchedPost;

  return (
    <div>
      <div>Post Details</div>
      <div>{post.title}</div>
      {post.mediaUrl[0] && (
        <img src={post.mediaUrl[0]} alt="" width={300} height={300} />
      )}
      <div>{post.content}</div>
      <div className={style["like-dislike-container"]}>
        <div>
          <span
            onClick={handleLike}
            className={`icon ${style["like-icon"]}`}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div>{post.likes}</div>
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
            style={{ color: post.favorited ? "red" : "black" }}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default PostDetails;
