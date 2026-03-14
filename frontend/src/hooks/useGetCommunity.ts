import { useQuery } from "@tanstack/react-query";
import type { Communities } from "backend/generated/prisma/client";
import communityService from "../api/communityService";

export const useGetCommunity = (communityId: string) => {
  const {
    data: communityData,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery<Communities>({
    queryKey: ["community", communityId],
    queryFn: async () => await communityService.fetchCommunity(communityId!),
  });

  return { communityData, communityLoading, communityError };
};
