import { useQuery } from "@tanstack/react-query";
import userService from "../api/userService";
import type { UserSession } from "backend";

export const useGetCurrentUser = () => {
  const { data: currentUser, isLoading: userLoading } = useQuery<UserSession>({
    queryKey: ["me"],
    queryFn: () => userService.fetchMe(),
    enabled: false,
  });

  return { currentUser, userLoading };
};
