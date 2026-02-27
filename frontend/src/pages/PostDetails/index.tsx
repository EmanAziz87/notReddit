import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import postService from "../../api/postService";
import style from "./PostDetails.module.css";
import type { PostsWithExtraData } from "backend";

interface PostDetails {
  communityId: string;
  postId: string;
  isLike: boolean;
}

interface CachedPost {
  fetchedPost: PostsWithExtraData;
}

const PostDetails = () => {
  const queryClient = useQueryClient();
  const { communityId, postId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async (): Promise<CachedPost> => {
      const response = await postService.fetchPost(communityId!, postId!);
      return { fetchedPost: response.fetchedPost };
    },
  });
  const likeDislikePost = useMutation({
    mutationFn: async (postDetails: PostDetails) => {
      if (postDetails.isLike) {
        await postService.likePost(
          postDetails.communityId!,
          postDetails.postId!,
        );
      } else {
        await postService.dislikePost(
          postDetails.communityId!,
          postDetails.postId!,
        );
      }
    },
    onMutate: async (
      postDetails: PostDetails,
    ): Promise<{ previousPost?: CachedPost }> => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPost = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);

      console.log("CACHED POST: ", previousPost);

      if (previousPost && previousPost.fetchedPost) {
        const targetReaction = postDetails.isLike ? "like" : "dislike";
        const currentReaction = previousPost.fetchedPost.userReaction;
        queryClient.setQueryData(["post", postId], {
          fetchedPost: {
            ...previousPost.fetchedPost,
            likes: postDetails.isLike
              ? previousPost.fetchedPost.likes + 1
              : previousPost.fetchedPost.likes - 1,
            userReaction: currentReaction === null ? targetReaction : null,
          },
        });
      }

      return { previousPost };
    },
    onError: (
      _err: Error,
      _variables: any,
      context?: { previousPost?: CachedPost },
    ) => {
      queryClient.setQueryData(["post", postId], context?.previousPost);
      console.error("Failed to like/dislike post, rolling back");
    },
  });

  const handleLike = () => {
    const cachedPost = queryClient.getQueryData<CachedPost>(["post", postId]);
    console.log("CACHED POST: ", cachedPost);
    if (cachedPost?.fetchedPost.userReaction !== "liked") {
      likeDislikePost.mutate({
        communityId: communityId!,
        postId: postId!,
        isLike: true,
      });
    }
  };

  const handleDislike = () => {
    const cachedPost = queryClient.getQueryData<CachedPost>(["post", postId]);
    if (cachedPost?.fetchedPost.userReaction !== "disliked") {
      console.log("in dislike condition");
      likeDislikePost.mutate({
        communityId: communityId!,
        postId: postId!,
        isLike: false,
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <div>post details</div>
      <div>{data.fetchedPost.title}</div>
      <img src={data.fetchedPost.mediaUrl[0]} alt="" width={300} height={300} />
      <div>{data.fetchedPost.content}</div>
      <div className={style[`like-dislike-container`]}>
        <div>
          <span onClick={handleLike} className={`icon ${style["like-icon"]}`} />
        </div>
        <div>{data.fetchedPost.likes}</div>
        <div>
          <span
            onClick={handleDislike}
            className={`icon ${style["dislike-icon"]}`}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default PostDetails;
