import { DateTime } from "luxon";
import Icon from "@mdi/react";
import { mdiAccountHardHatOutline } from "@mdi/js";

export const WorkerItem = ({ worker, handleWorkerCardClick }) => {
  return (
    <div className="workerCard" id={worker._id} onClick={handleWorkerCardClick}>
      <div className="profileContainer">
        <Icon
          className="workerIcon"
          path={mdiAccountHardHatOutline}
          size={2.5}
        />
        <div className="name">
          <div>{worker.firstname}</div>
          <div>{worker.lastname}</div>
        </div>
      </div>
      <div>
        Born On{" "}
        {DateTime.fromISO(worker.dateofbirth).setLocale("fr").toLocaleString({
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      {worker.cni && <div>CNI N° {worker.cni}</div>}
      <div className="seemore">See More</div>
    </div>
  );
};
