import { Outlet } from "react-router";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import styles from "./RootLayout.module.css";

const RootLayout = () => {
  return (
    <div className="root-container">
      <Header />
      <div className={styles["main-sidebar-container"]}>
        <main>
          <Outlet />
        </main>
        <SideBar />
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
