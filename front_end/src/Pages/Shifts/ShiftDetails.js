import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "../../styles/ShiftDetails.css";
import { mdiPauseOctagonOutline, mdiAccountHardHatOutline } from "@mdi/js";
import { mdiCloseOctagonOutline } from "@mdi/js";
import AddInterruptionForm from "./AddInterruptionForm";
import EndShiftForm from "./EndShiftForm";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import { mdiPauseOctagon } from "@mdi/js";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { mdiCheckboxMultipleMarked } from "@mdi/js";
import { mdiCheckboxMultipleBlank } from "@mdi/js";

const ShiftsDetails = (props) => {
  const { handleClose } = props;
  const { setisLoading } = props;
  const { setshifts } = props;
  const { shifts } = props;
  const { selected_id } = props;
  const [shift, setshift] = useState({});
  const [shiftinstances, setshiftinstances] = useState([]);
  const [instancesSearchResults, setinstancesSearchResults] = useState([]);
  const [interruptions, setinterruptions] = useState([]);
  const [addInterruption, setaddInterruption] = useState(false);
  const [endShift, setendShift] = useState(false);
  const [filterby, setfilterby] = useState("all");

  async function getShift(signal) {
    const res = await fetch(`/api/shifts/${selected_id}`, {
      signal: signal,
    });
    const datas = await res.json();
    return datas;
  }

  async function getShiftInstances(signal) {
    const res = await fetch(`/api/shifts/${selected_id}/workers`, {
      signal: signal,
    });
    const datas = await res.json();
    return datas;
  }

  async function getInterruptions(signal) {
    const res = await fetch(`/api/shifts/${selected_id}/interruptions`, {
      signal: signal,
    });
    const datas = await res.json();
    return Promise.all(
      datas.map((interruption) => getInterruptionInstances(interruption))
    );
  }

  async function getInterruptionInstances(interruption) {
    const res = await fetch(
      `/api/interruptions/${interruption._id}/shiftinstances`
    );
    const instances = await res.json();
    return { ...interruption, instances };
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

  const showInterruptionDetails = (e) => {
    const interruptionWorkersOpened = document.querySelector(
      ".interruptionWorkers.show"
    );
    if (interruptionWorkersOpened)
      interruptionWorkersOpened.classList.remove("show");
    const target = e.currentTarget;
    const id = target.getAttribute("id");
    const interruptionWorkers = document.querySelector(
      `.interruptionWorkers[data-interruption="${id}"]`
    );
    interruptionWorkers.classList.add("show");
  };

  const closeInterruptionDetails = (e) => {
    const target = e.target;
    const interruptionWorkers = document.querySelector(
      ".interruptionWorkers.show"
    );
    if (
      !target.classList.contains("interruptionItem") &&
      !target.closest(".interruptionItem")
    ) {
      if (interruptionWorkers) interruptionWorkers.classList.remove("show");
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setfilterby(value);
  };

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;

    window.addEventListener("click", closeInterruptionDetails);

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
      window.removeEventListener("click", closeInterruptionDetails);
    };
  }, []);

  useEffect(() => {
    switch (filterby) {
      case "ended":
        setinstancesSearchResults(
          shiftinstances.filter((instance) => instance.endedshift === true)
        );
        break;
      case "notended":
        setinstancesSearchResults(
          shiftinstances.filter((instance) => instance.endedshift !== true)
        );
        break;
      default:
        setinstancesSearchResults(shiftinstances);
        break;
    }
  }, [filterby, shiftinstances]);

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
      {shift.status && shift.status === "opened" && (
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
      )}
      {addInterruption && shift.status === "opened" && (
        <AddInterruptionForm
          selected_id={selected_id}
          handleCloseAddInterruptionForm={handleCloseAddInterruptionForm}
          handleCheckboxChange={handleCheckboxChange}
          shiftinstances={shiftinstances}
          setshiftinstances={setshiftinstances}
          interruptions={interruptions}
          setinterruptions={setinterruptions}
          setisLoading={setisLoading}
        />
      )}
      {endShift && shift.status === "opened" && (
        <EndShiftForm
          selected_id={selected_id}
          handleCloseEndShiftForm={handleCloseEndShiftForm}
          handleCheckboxChange={handleCheckboxChange}
          shiftinstances={shiftinstances}
          setshiftinstances={setshiftinstances}
          shifts={shifts}
          setshifts={setshifts}
          setshift={setshift}
          setisLoading={setisLoading}
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
      {shift.status && shift.status === "closed" && (
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={filterby}
            onChange={handleFilterChange}
          >
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All"
              labelPlacement="start"
            />
            <FormControlLabel
              value="ended"
              control={<Radio />}
              label="Shift Ended"
              labelPlacement="start"
            />
            <FormControlLabel
              value="notended"
              control={<Radio />}
              label="Shift Not Ended"
              labelPlacement="start"
            />
          </RadioGroup>
        </FormControl>
      )}
      {instancesSearchResults.length > 0 ? (
        <div className="workersgrid">
          {instancesSearchResults.map((instance) => {
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
                {/* <div>
                  Born On{" "}
                  {DateTime.fromISO(instance.docker.dateofbirth)
                    .setLocale("fr")
                    .toLocaleString({
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </div> */}
                <div className="workerItemSubgrid">
                  <div className="startedshift">
                    Started shift{" "}
                    {instance.startedshift ? (
                      <Icon
                        className="checkboxdone"
                        path={mdiCheckboxMultipleMarked}
                        size={1}
                      />
                    ) : (
                      <Icon
                        className="checkboxdone"
                        path={mdiCheckboxMultipleBlank}
                        size={1}
                      />
                    )}
                  </div>
                  <div className="endedshift">
                    Ended shift
                    {instance.endedshift ? (
                      <Icon
                        className="checkboxdone"
                        path={mdiCheckboxMultipleMarked}
                        size={1}
                      />
                    ) : (
                      <Icon
                        className="checkboxdone"
                        path={mdiCheckboxMultipleBlank}
                        size={1}
                      />
                    )}
                  </div>

                  {instance.operation && instance.operation.type && (
                    <div className="operationdetails">
                      <div>Operation Type</div>
                      <div> {instance.operation.type}</div>
                    </div>
                  )}
                  {instance.operation && instance.operation.vessel && (
                    <div className="operationdetails">
                      <div>Operation Vessel</div>
                      <div>{instance.operation.vessel}</div>
                    </div>
                  )}
                  {instance.operation && instance.operation.position && (
                    <div className="operationdetails">
                      <div>Operation Position</div>
                      <div>{instance.operation.position}</div>
                    </div>
                  )}
                </div>
                {instance.operation && instance.operation.description && (
                  <div className="operationdetails">
                    <div>Operation description</div>
                    <div>{instance.operation.description}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="noDatasInfos">No Workers...</div>
      )}
      <div style={{ marginTop: "15px" }}>
        Total workers {instancesSearchResults.length}
      </div>
      <h3>Interruptions / Incidents</h3>
      {interruptions.length > 0 ? (
        <div className="interruptionsgrid">
          {interruptions.map((interruption) => {
            return (
              <div
                key={interruption._id}
                className="interruptionItem"
                onClick={showInterruptionDetails}
                id={interruption._id}
              >
                <Icon path={mdiPauseOctagon} size={1} />
                <div>
                  <div>{interruption.duration} mins</div>
                  <div>{interruption.description}</div>
                </div>
                <div
                  className="interruptionWorkers"
                  data-interruption={interruption._id}
                >
                  {interruption.starttime && (
                    <div className="interruptionTime">
                      {interruption.starttime} - {interruption.endtime}
                    </div>
                  )}
                  <ul>
                    {interruption.instances &&
                      interruption.instances.map((instance) => (
                        <li
                          key={instance._id}
                        >{`${instance.docker.firstname} ${instance.docker.lastname}`}</li>
                      ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="noDatasInfos">No Interruptions / Incidents...</div>
      )}
    </Box>
  );
};

export default ShiftsDetails;
