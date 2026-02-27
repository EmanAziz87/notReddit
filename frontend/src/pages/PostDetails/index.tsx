import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import postService from "../../api/postService";

const PostDetails = () => {
  const { communityId, postId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.fetchPost(communityId!, postId!),
  });
  //   const likePost = useMutation({
  //     mutationFn:
  //   })

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>post details</div>
      <div>{data.fetchedPost.title}</div>
      <img src={data.fetchedPost.mediaUrl} alt="" width={300} height={300} />
      <div>{data.fetchedPost.content}</div>
      <div>Likes: {data.fetchedPost.likes}</div>
      <div>Dislikes: {data.fetchedPost.dislikes}</div>
      <br />
    </div>
  );
};

export default PostDetails;
