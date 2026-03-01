import { useParams } from "react-router";
import style from "./PostDetails.module.css";
import type { CachedPost } from "../../types";
import { useSetPostReaction } from "../../hooks/useSetPostReaction";
import { useGetPost } from "../../hooks/useGetPost";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "../../api/postService";
import { useRef } from "react";

const PostDetails = () => {
  const queryClient = useQueryClient();

  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const {
    data,
    isLoading,
    error,
  }: { data: CachedPost | undefined; isLoading: boolean; error: Error | null } =
    useGetPost(communityId, postId);

  const {
    handleLike,
    handleDislike,
  }: { handleLike: () => void; handleDislike: () => void } = useSetPostReaction(
    communityId,
    postId,
  );

  const setFavoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) =>
      await postService.setFavorite(communityId!, postId!, favorite),
    onMutate: async () => {
      const cached = queryClient.getQueryData(["post", postId]);

      return { previousPost: cached };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["post", postId], context?.previousPost);
      console.error(
        "error occured in setFavoriteMutation, rolling back changes on post",
      );
    },
  });

  const applyOptimisticUpdate = (favorite: boolean) => {
    const cache = queryClient.getQueryData<CachedPost>(["post", postId]);

    if (!cache) return;

    queryClient.setQueryData(["post", postId], {
      fetchedPost: {
        ...cache.fetchedPost,
        favorited: favorite,
      },
    });
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFavorite = () => {
    const cachedPost = queryClient.getQueryData<CachedPost>(["post", postId]);

    const nextFavoritedState: boolean = !cachedPost?.fetchedPost.favorited;

    applyOptimisticUpdate(nextFavoritedState);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);
      console.log(
        "firing API call with favorite:",
        finalCached?.fetchedPost.favorited,
      );

      setFavoriteMutation.mutate(finalCached?.fetchedPost.favorited ?? false);
    }, 300);
  };

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
