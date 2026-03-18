import { NavLink, useNavigate } from "react-router";
import styles from "./Header.module.css";
import { useLogout } from "../../hooks/useLogout";
import { useGetMe } from "../../hooks/useGetMe";

const Header = () => {
  const navigate = useNavigate();

  const { handleUserLogout } = useLogout();
  const { user, userIsLoading } = useGetMe();

  const handleShowLoginState = () => {
    if (userIsLoading) {
      return <div>logging in</div>;
    } else {
      return user ? (
        <div>
          <img
            className={styles["profile-pic-image"]}
            src={user.profileImageUrl}
            alt="profile picture"
          />
          <NavLink to={`/profile/${user.id}`}>{user.username}</NavLink>
          <button onClick={handleUserLogout}>Log out</button>
        </div>
      ) : (
        <div>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register">Register</NavLink>
        </div>
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
      {user && (
        <NavLink to={"community/createCommunity"}>Create Community</NavLink>
      )}
    </div>
  );
};

export default Header;
