import type { PostsWithRelationsNoComments } from "backend";
import styles from "./PostCard.module.css";

const PostCard = ({ post }: { post: PostsWithRelationsNoComments }) => {
  return (
    <div className={styles["post-card-container"]}>
      <div>{post.title}</div>
      <div>{post.author.username}</div>
      <br />
      <img src={`${post.mediaUrl[0]}`} alt="" width={300} height={300} />
      <br />
    </div>
  );
};

export default PostCard;
