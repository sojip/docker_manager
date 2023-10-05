import { Link } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccountMultiple } from "@mdi/js";
import { mdiCarShiftPattern } from "@mdi/js";
import { mdiMonitorDashboard } from "@mdi/js";
import { mdiSecurity } from "@mdi/js";
import "./Home.css";

const Home = () => {
  return (
    <div className="homeGrid">
      <div className="homeItem">
        <Link to="/workers" className="homeLink">
          <Icon path={mdiAccountMultiple} size={1} />
          Workers
        </Link>
      </div>
      <div className="homeItem">
        <Link to="/shifts" className="homeLink">
          <Icon path={mdiCarShiftPattern} size={1} />
          Shifts
        </Link>
      </div>
      <div className="homeItem">
        <Link to="/access-events" className="homeLink">
          <Icon path={mdiSecurity} size={1} />
          Access Events
        </Link>
      </div>
      <div className="homeItem">
        <Link to="/stats" className="homeLink">
          <Icon path={mdiMonitorDashboard} size={1} />
          Stats
        </Link>
      </div>
    </div>
  );
};

export default Home;
