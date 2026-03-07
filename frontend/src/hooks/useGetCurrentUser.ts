import { useQuery } from "@tanstack/react-query";
import userService from "../api/userService";

export const useGetCurrentUser = () => {
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => userService.fetchMe(),
    enabled: false,
  });

  return { currentUser, userLoading };
};
