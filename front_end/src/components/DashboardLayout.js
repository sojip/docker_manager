import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import { Outlet } from "react-router-dom";

const DashboardLayout = (props) => {
  const { setisLoggedIn } = props;
  return (
    <>
      <AppHeader setisLoggedIn={setisLoggedIn} />
      <AppNav />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;
