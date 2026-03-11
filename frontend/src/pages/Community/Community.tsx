import { useQuery } from "@tanstack/react-query";
import { NavLink, useParams } from "react-router";
import communityService from "../../api/communityService";
import type { Communities } from "backend/generated/prisma/client";
import type { PostsWithRelationsNoComments } from "backend";
import postService from "../../api/postService";

const Community = () => {
  const { communityId } = useParams();

  const {
    data: communityData,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery<Communities>({
    queryKey: ["community", communityId],
    queryFn: async () => await communityService.fetchCommunity(communityId!),
  });

  const {
    data: communityPostsData,
    isLoading: communityPostsLoading,
    error: communityPostsError,
  } = useQuery<PostsWithRelationsNoComments[]>({
    queryKey: ["communityPosts", communityId],
    queryFn: async () => await postService.fetchCommunityPosts(communityId!),
  });

  if (communityLoading && communityPostsLoading) return <div>Loading...</div>;
  if (communityError && communityPostsError)
    return <div>Post Error: {communityError.message}</div>;
  if (!communityData && !communityPostsData) return null;

  return (
    <div>
      <h2>{communityData.name}</h2>
      <div>{communityData.description}</div>
      <div>Followers: {communityData.followers}</div>
      <NavLink to={`/community/${communityId}/createPost`}>Create post</NavLink>
    </div>
  );
};

export default Community;
