import Header from "./Header";
import Nav from "./Nav";
import { Outlet } from "react-router-dom";

const DashboardLayout = (props) => {
  return (
    <>
      <Header />
      <Nav />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;
