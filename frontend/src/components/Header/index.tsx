import { NavLink, useNavigate } from "react-router";
import styles from "./Header.module.css";
import userService from "../../api/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "backend";

const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: userService.fetchMe,
    staleTime: 1000 * 60 * 5,
  });

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

  return (
    <div className={styles["header-container"]}>
      <div className={styles["menu-icon-container"]}>
        <span className={`${styles["icon"]} ${styles["menu-icon"]}`}></span>
      </div>
      <div>
        <h3 onClick={() => navigate("/")} className={styles["header-title"]}>
          notReddit
        </h3>
      </div>
      <div>
        <input type="text" className={styles["header-search-bar"]} />
      </div>
      <div>
        {user ? (
          <div>
            <NavLink to={`/profile/${user.id}`}>{user.username}</NavLink>
            <button onClick={handleUserLogout}>Log out</button>
          </div>
        ) : (
          <NavLink to="/login">Log in</NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
