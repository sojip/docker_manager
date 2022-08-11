import Icon from "@mdi/react";
import { mdiAccountMultiple } from "@mdi/js";
import { mdiCarShiftPattern } from "@mdi/js";
import { mdiMonitorDashboard } from "@mdi/js";
import { mdiHome } from "@mdi/js";
import { NavLink } from "react-router-dom";
import "../styles/AppNav.css";

const AppNav = () => {
  let activeStyle = {
    color: "var(--orange-color)",
  };
  return (
    <nav>
      <ul>
        <li className="navitem">
          <NavLink
            to="/"
            className="navLink"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            <Icon path={mdiHome} size={1} className="navIcon" />
            <div className="navitemDesc">Home</div>
          </NavLink>
        </li>
        <li className="navitem">
          <NavLink
            to="/workers"
            className="navLink"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            <Icon path={mdiAccountMultiple} size={1} />
            <div className="navitemDesc">workers</div>
          </NavLink>
        </li>
        <li className="navitem">
          <NavLink
            to="/shifts"
            className="navLink"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            <Icon path={mdiCarShiftPattern} size={1} />
            <div className="navitemDesc">shifts</div>
          </NavLink>
        </li>
        <li className="navitem">
          <NavLink
            to="/stats"
            className="navLink"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            <Icon path={mdiMonitorDashboard} size={1} />
            <div className="navitemDesc">Stats</div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default AppNav;
