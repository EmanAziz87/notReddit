import { useQuery } from "@tanstack/react-query";
import { NavLink, useParams } from "react-router";
import communityService from "../../api/communityService";
import type { Communities } from "backend/generated/prisma/client";

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

  if (communityLoading) return <div>Loading...</div>;
  if (communityError) return <div>Post Error: {communityError.message}</div>;
  if (!communityData) return null;

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
