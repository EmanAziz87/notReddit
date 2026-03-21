import { useQuery } from "@tanstack/react-query";
import postService from "../../api/postService";
import { NavLink } from "react-router";
import type {
  PostsWithMinimalRelations,
  PostsWithRelationsNoComments,
} from "backend";
import styles from "./HomeFeed.module.css";
import PostReactionArrows from "../../components/PostReaction/PostReactionArrows";

const HomeFeed = () => {
  const {
    data: allFetchedPosts,
    isLoading,
    error,
  } = useQuery<PostsWithRelationsNoComments[]>({
    queryKey: ["allPosts"],
    queryFn: () => postService.fetchAllPosts(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!allFetchedPosts) return null;
  else {
    console.log("All fetched posts: ", allFetchedPosts);
  }

  return (
    <div>
      Posts
      <ul>
        {allFetchedPosts.map((post: PostsWithRelationsNoComments) => {
          return (
            <div key={post.id}>
              <NavLink to={`/post/${post.communityId}/${post.id}`}>
                <div>{post.title}</div>
              </NavLink>
              <NavLink to={`/community/${post.communityId}`}>
                <div>
                  <img
                    src={post.community.profileImageUrl || undefined}
                    alt="Community Profile Image"
                    className={styles["community-profile-pic-image"]}
                  />
                </div>
                {post.community.name}
              </NavLink>
              <NavLink to={`/post/${post.communityId}/${post.id}`}>
                <div>{post.author.username}</div>
                <img src={post.mediaUrl[0]} alt="" width={300} height={300} />
                <div>{post.content}</div>
                <div>Likes: {post.likes}</div>
                <br />
              </NavLink>
              <PostReactionArrows
                communityId={String(post.communityId)}
                postId={String(post.id)}
                postFavorited={post.favorited}
                postLikes={post.likes}
              />
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default HomeFeed;
