import { useQuery } from "@tanstack/react-query";
import postService from "../../api/postService";
import { NavLink, useNavigate } from "react-router";
import type { PostsWithMinimalRelations } from "backend";

const HomeFeed = () => {
  const navigate = useNavigate();
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
            <div key={post.id}>
              <NavLink to={`/post/${post.communityId}/${post.id}`}>
                <div>{post.title}</div>
              </NavLink>
              <NavLink to={`/community/${post.communityId}`}>
                {post.community.name}
              </NavLink>
              <NavLink to={`/post/${post.communityId}/${post.id}`}>
                <div>{post.author.username}</div>
                <img src={post.mediaUrl[0]} alt="" width={300} height={300} />
                <div>{post.content}</div>
                <div>Likes: {post.likes}</div>
                <br />
              </NavLink>
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default HomeFeed;
