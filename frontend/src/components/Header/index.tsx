import { NavLink, useNavigate } from "react-router";
import styles from "./Header.module.css";
import userService from "../../api/userService";
import { useQuery } from "@tanstack/react-query";

const Header = () => {
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: userService.fetchMe,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className={styles["header-container"]}>
      <div className={styles["menu-icon-container"]}>
        <span className={`${styles["icon"]} ${styles["menu-icon"]}`}></span>
      </div>
      <div>
        <h3 onClick={() => navigate("/")} className={styles["header-title"]}>
          Super Fucking Reddit
        </h3>
      </div>
      <div>
        <input type="text" className={styles["header-search-bar"]} />
      </div>
      <div>
        {user ? (
          <NavLink to={`/profile/${user.id}`}>{user.username}</NavLink>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
