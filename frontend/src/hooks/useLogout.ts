import { useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "../api/userService";
import type { UserSession } from "backend";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const userLogoutMutation = useMutation({
    mutationFn: async () => await userService.logout(),
    onMutate: () => {
      const previousLoggedInUser = queryClient.getQueryData<UserSession>([
        "me",
      ]);
      return previousLoggedInUser;
    },
    onError: (_error, _variables, previousLoggedInUser) => {
      queryClient.setQueryData(["me"], previousLoggedInUser);
      console.error("error logging out, rolling back log in");
    },
    onSettled: () => {
      queryClient.setQueryData(["me"], null);
    },
  });

  const handleUserLogout = () => {
    userLogoutMutation.mutate();
  };

  return { handleUserLogout };
};
