import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "../styles/ShiftDetails.css";
import { mdiPauseOctagonOutline, mdiAccountHardHatOutline } from "@mdi/js";
import { mdiCloseOctagonOutline } from "@mdi/js";
import AddInterruptionForm from "./AddInterruptionForm";
import EndShiftForm from "./EndShiftForm";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";

const ShiftsDetails = (props) => {
  const { handleClose } = props;
  const { selected_id } = props;
  const { setisLoading } = props;
  const [shift, setshift] = useState({});
  const [shiftinstances, setshiftinstances] = useState([]);
  const [interruptions, setinterruptions] = useState([]);
  const [addInterruption, setaddInterruption] = useState(false);
  const [endShift, setendShift] = useState(false);

  async function getShift(signal) {
    const res = await fetch(`http://localhost:3000/api/shifts/${selected_id}`, {
      signal: signal,
    });
    const datas = await res.json();
    return datas;
  }

  async function getShiftInstances(signal) {
    const res = await fetch(
      `http://localhost:3000/api/shifts/${selected_id}/workers`,
      {
        signal: signal,
      }
    );
    const datas = await res.json();
    return datas;
  }

  async function getInterruptions(signal) {
    const res = await fetch(
      `http://localhost:3000/api/shifts/${selected_id}/interruptions`,
      {
        signal: signal,
      }
    );
    const datas = await res.json();
    console.log("interruptions");
    console.log(datas);
    return datas;
  }

  const handleAddInterruptionClick = () => {
    setendShift(false);
    setaddInterruption(true);
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
  };

  const handleEndShiftClick = () => {
    setendShift(true);
    setaddInterruption(false);
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
  };

  const handleCloseAddInterruptionForm = () => {
    let form = document.querySelector("#addInterruptionForm");
    form.reset();
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
    setaddInterruption(false);
  };

  const handleCloseEndShiftForm = () => {
    let form = document.querySelector("#endShiftForm");
    form.reset();
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
    setendShift(false);
  };

  const handleCheckboxChange = (e) => {
    setshiftinstances(
      shiftinstances.map((instance) => {
        if (instance.docker._id === e.target.id)
          instance.checked = !instance.checked;
        return instance;
      })
    );
  };

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;

    Promise.all([
      getShift(signal),
      getShiftInstances(signal),
      getInterruptions(signal),
    ])
      .then((datas) => {
        setshift(datas[0]);
        setshiftinstances(
          datas[1].map((instance) => {
            return { ...instance, checked: false };
          })
        );
        setinterruptions(datas[2]);
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          alertify.error("An Error Occured");
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.log(shiftinstances);
  }, [shiftinstances]);

  return (
    <Box
      id="showshiftbox"
      sx={{
        width: "96%",
        maxWidth: "800px",
        padding: "2vh 1vw",
        "& > :not(style)": { width: "100%" },
        bgcolor: "background.paper",
        margin: "auto",
        boxShadow: 24,
        p: 4,
      }}
    >
      <div className="closeModalWrapper" id="closeModal" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>
      <h3>General</h3>
      <div className="callToActions">
        <div
          className="oulinedButtonWrapper"
          onClick={handleAddInterruptionClick}
        >
          <Icon path={mdiPauseOctagonOutline} size={1} />
          Add Interruption
        </div>
        <div className="oulinedButtonWrapper" onClick={handleEndShiftClick}>
          <Icon path={mdiCloseOctagonOutline} size={1} />
          Close Shift
        </div>
      </div>
      {addInterruption && (
        <AddInterruptionForm
          handleCloseAddInterruptionForm={handleCloseAddInterruptionForm}
          shiftinstances={shiftinstances}
          setshiftinstances={setshiftinstances}
          handleCheckboxChange={handleCheckboxChange}
          selected_id={selected_id}
          interruptions={interruptions}
          setinterruptions={setinterruptions}
        />
      )}
      {endShift && (
        <EndShiftForm
          handleCloseEndShiftForm={handleCloseEndShiftForm}
          shiftinstances={shiftinstances}
          setshiftinstances={setshiftinstances}
          handleCheckboxChange={handleCheckboxChange}
        />
      )}

      <div className="generalInfos">
        <div>Shift {shift.type}</div>
        <div>
          Start On{" "}
          {DateTime.fromISO(shift.startdate).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div>
          End On{" "}
          {DateTime.fromISO(shift.enddate).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
      <h3>Workers</h3>
      <div className="workersgrid">
        {shiftinstances.map((instance) => {
          return (
            <div key={instance.docker._id} className="workerItem">
              <div className="profileContainer">
                <Icon
                  id="workerIcon"
                  path={mdiAccountHardHatOutline}
                  size={2.5}
                />
                <div className="name">
                  <div>{instance.docker.firstname}</div>
                  <div>{instance.docker.lastname}</div>
                </div>
              </div>
              <div>
                Born On{" "}
                {DateTime.fromISO(instance.docker.dateofbirth)
                  .setLocale("fr")
                  .toLocaleString({
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <h3>Interruptions / Incidents</h3>
      {interruptions.length > 0 ? (
        <div className="interruptionsgrid">
          {interruptions.map((interruption) => {
            return (
              <div key={interruption._id} className="interruptionItem">
                <div>{interruption.description}</div>
                <div>Duration {interruption.duration} mins</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="noDatasInfos">No Interruptions / Incidents</div>
      )}
    </Box>
  );
};

export default ShiftsDetails;
