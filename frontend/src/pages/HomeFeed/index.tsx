import { useQuery } from "@tanstack/react-query";
import postService from "../../api/postService";
import { NavLink } from "react-router";
import type { PostsWithMinimalRelations } from "backend";

const HomeFeed = () => {
  const {
    data: allFetchedPosts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allPosts"],
    queryFn: () => postService.fetchAllPosts(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (allFetchedPosts) console.log("fetched data: ", allFetchedPosts);

  return (
    <div>
      Posts
      <ul>
        {allFetchedPosts.map((post: PostsWithMinimalRelations) => {
          return (
            <NavLink to={`/post/${post.communityId}/${post.id}`} key={post.id}>
              <div>{post.title}</div>
              <div>{post.author.username}</div>
              <img src={post.mediaUrl[0]} alt="" width={300} height={300} />
              <div>{post.content}</div>
              <div>Likes: {post.likes}</div>
              <div>Dislikes: {post.dislikes}</div>
              <br />
            </NavLink>
          );
        })}
      </ul>
    </div>
  );
};

export default HomeFeed;
