import { NavLink, useNavigate } from "react-router";
import styles from "./Header.module.css";
import userService from "../../api/userService";
import { useQuery } from "@tanstack/react-query";
import type { UserSession } from "backend";
import { useLogout } from "../../hooks/useLogout";

const Header = () => {
  const navigate = useNavigate();

  const { handleUserLogout } = useLogout();
  const { user, userIsLoading } = useGetMe();

  const handleShowLoginState = () => {
    if (isLoading) {
      return <div>logging in</div>;
    } else {
      return user ? (
        <div>
          <NavLink to={`/profile/${user.id}`}>{user.username}</NavLink>
          <button onClick={handleUserLogout}>Log out</button>
        </div>
      ) : (
        <NavLink to="/login">Log in</NavLink>
      );
    }
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
      <div>{handleShowLoginState()}</div>
    </div>
  );
};

export default Header;
