import { useQuery } from "@tanstack/react-query";
import userService from "../api/userService";
import type { UserSession } from "backend";

export const useGetMe = () => {
  const { data: user, isLoading: userIsLoading } = useQuery<UserSession>({
    queryKey: ["me"],
    queryFn: async () => await userService.fetchMe(),
    staleTime: 1000 * 60 * 5,
  });

  return { user, userIsLoading };
};
