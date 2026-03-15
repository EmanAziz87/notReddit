import type { PostsWithRelationsNoComments } from "backend";
import styles from "./PostCard.module.css";
import PostReactionArrows from "../PostReaction/PostReactionArrows";
import { NavLink } from "react-router";

const PostCard = ({ post }: { post: PostsWithRelationsNoComments }) => {
  return (
    <div className={styles["post-card-container"]}>
      <NavLink key={post.id} to={`/post/${post.communityId}/${post.id}`}>
        <div>{post.title}</div>
        <div>{post.author.username}</div>
        <br />
        <img src={`${post.mediaUrl[0]}`} alt="" width={300} height={300} />
      </NavLink>
      <br />
      <PostReactionArrows
        communityId={String(post.communityId)}
        postId={String(post.id)}
        postFavorited={post.favorited}
        postLikes={post.likes}
      />
    </div>
  );
};

export default PostCard;
