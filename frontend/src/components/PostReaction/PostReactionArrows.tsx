import { useGetCurrentUser } from "../../hooks/useGetCurrentUser";
import { useSetPostFavorite } from "../../hooks/useSetPostFavorite";
import { useSetPostReaction } from "../../hooks/useSetPostReaction";
import style from "./PostReactionArrows.module.css";

const PostReactionArrows = ({
  communityId,
  postId,
  postFavorited,
  postLikes,
}: {
  communityId: string;
  postId: string;
  postFavorited: boolean;
  postLikes: number;
}) => {
  const { currentUser, userLoading } = useGetCurrentUser();
  const { handleLike, handleDislike } = useSetPostReaction(communityId, postId);
  const { handleFavorite } = useSetPostFavorite(communityId, postId);
  if (userLoading) return null;
  const loggedIn = currentUser ? true : false;
  return (
    <div className={style["like-dislike-container"]}>
      <div>
        <span
          onClick={() => (loggedIn ? handleLike() : undefined)}
          className={`icon ${style["like-icon"]}`}
          style={loggedIn ? { cursor: "pointer" } : undefined}
        />
      </div>
      <div>{postLikes}</div>
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
            color: postFavorited ? "red" : "black",
            ...(loggedIn ? { cursor: "pointer" } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default PostReactionArrows;
