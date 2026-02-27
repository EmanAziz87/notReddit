import { useQuery } from "@tanstack/react-query";
import postService from "../../api/postService";
import { NavLink } from "react-router";

const HomeFeed = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["allPosts"],
    queryFn: () => postService.fetchAllPosts(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (data) console.log("fetched data: ", data);

  return (
    <div>
      Posts
      <ul>
        {data.allFetchedPosts.map((post: any) => {
          return (
            <NavLink to={`/post/${post.communityId}/${post.id}`} key={post.id}>
              <div>{post.title}</div>
              <img src={post.mediaUrl} alt="" width={300} height={300} />
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
