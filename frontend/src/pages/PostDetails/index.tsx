import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import postService from "../../api/postService";
import style from "./PostDetails.module.css";
import type { PostsWithExtraData } from "backend";
import { useRef } from "react";

interface ReactionMutation {
  communityId: string;
  postId: string;
  reaction: "LIKE" | "DISLIKE" | "NONE";
}

interface CachedPost {
  fetchedPost: PostsWithExtraData;
}

const PostDetails = () => {
  const queryClient = useQueryClient();
  const { communityId, postId } = useParams<{
    communityId: string;
    postId: string;
  }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async (): Promise<CachedPost> => {
      const response = await postService.fetchPost(communityId!, postId!);
      console.log("FETCHED POST: ", response.fetchedPost);
      return { fetchedPost: response.fetchedPost };
    },
  });

  const setReactionMutation = useMutation({
    mutationFn: async (vars: ReactionMutation) => {
      await postService.setReaction(
        vars.communityId,
        vars.postId,
        vars.reaction,
      );
    },
    onMutate: async () => {
      const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
      return { previousPost: cached };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyOptimisticUpdate = (reaction: "LIKE" | "DISLIKE" | "NONE") => {
    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
    if (!cached) return;

    let likes = cached.fetchedPost.likes;
    const prevReaction = cached.fetchedPost.userReaction;

    if (reaction === "LIKE") {
      if (prevReaction === "disliked") likes += 1;
      else if (prevReaction !== "liked") likes += 1;
    } else if (reaction === "DISLIKE") {
      if (prevReaction === "liked") likes -= 1;
      else if (prevReaction !== "disliked") likes -= 1;
    } else if (reaction === "NONE") {
      if (prevReaction === "liked") likes -= 1;
      if (prevReaction === "disliked") likes += 1;
    }

    queryClient.setQueryData(["post", postId], {
      fetchedPost: {
        ...cached.fetchedPost,
        likes,
        userReaction:
          reaction === "NONE"
            ? null
            : reaction === "LIKE" && prevReaction === "disliked"
              ? null
              : reaction === "DISLIKE" && prevReaction === "liked"
                ? null
                : reaction === "LIKE"
                  ? "liked"
                  : "disliked",
      },
    });
  };

  const handleReaction = (reaction: "LIKE" | "DISLIKE") => {
    const cached = queryClient.getQueryData<CachedPost>(["post", postId]);
    const current = cached?.fetchedPost.userReaction;
    const nextReaction =
      (reaction === "LIKE" && current === "liked") ||
      (reaction === "DISLIKE" && current === "disliked")
        ? "NONE"
        : reaction;

    applyOptimisticUpdate(nextReaction);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalCached = queryClient.getQueryData<CachedPost>([
        "post",
        postId,
      ]);
      const finalReaction = finalCached?.fetchedPost.userReaction;
      setReactionMutation.mutate({
        communityId: communityId!,
        postId: postId!,
        reaction:
          finalReaction === "liked"
            ? "LIKE"
            : finalReaction === "disliked"
              ? "DISLIKE"
              : "NONE",
      });
    }, 300);
  };

  const handleLike = () => handleReaction("LIKE");
  const handleDislike = () => handleReaction("DISLIKE");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  const post = data.fetchedPost;

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
          <span className={`icon ${style["favorite-icon"]}`} />
        </div>
      </div>
      <br />
    </div>
  );
};

export default PostDetails;
