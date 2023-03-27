import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState, useContext, useReducer } from "react";
import { DateTime } from "luxon";
import "../../styles/ShiftDetails.css";
import { mdiPauseOctagonOutline, mdiAccountHardHatOutline } from "@mdi/js";
import { mdiCloseOctagonOutline } from "@mdi/js";
import AddInterruptionForm from "./AddInterruptionForm";
import EndShiftForm from "./EndShiftForm";
import { mdiPauseOctagon } from "@mdi/js";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { mdiCheckboxMultipleMarked } from "@mdi/js";
import { mdiCheckboxMultipleBlank } from "@mdi/js";
import { Settings } from "luxon";
import { toast } from "react-toastify";
import { SelectedShiftContext } from "./Shifts";
import { INITIAL_STATE, detailsReducer } from "./shiftDetailsReducer";
import { Spinner } from "../../components/Spinner";

Settings.defaultZone = "UTC+1";

const ShiftsDetails = (props) => {
  const { handleClose } = props;
  const { selected_shift } = useContext(SelectedShiftContext);
  const [GLOBAL_STATE, dispatch] = useReducer(detailsReducer, INITIAL_STATE);
  const [filterby, setfilterby] = useState("all");
  const [instancesSearchResults, setinstancesSearchResults] = useState([]);
  const [isLoading, setisLoading] = useState(true);

  async function getShiftInstances(signal) {
    console.log(selected_shift._id);
    const res = await fetch(`/api/shifts/${selected_shift._id}/workers`, {
      signal: signal,
    });
    const datas = await res.json();
    // console.log(`/api/shifts/${selected_shift._id}/workers`);
    console.log(datas);
    return datas;
  }

  async function getInterruptions(signal) {
    const res = await fetch(`/api/shifts/${selected_shift._id}/interruptions`, {
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
    dispatch({ type: "TOGGLE_INTERRUPTION_FORM", payload: true });
  };

  const handleEndShiftClick = () => {
    dispatch({ type: "TOGGLE_ENDSHIFT_FORM", payload: true });
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
    if (interruptionWorkers) {
      if (
        !target.classList.contains("interruptionItem") &&
        !target.closest(".interruptionItem")
      ) {
        interruptionWorkers.classList.remove("show");
      }
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setfilterby(value);
  };

  useEffect(() => {
    let controller = new AbortController();
    let signal = controller.signal;

    Promise.all([getShiftInstances(signal), getInterruptions(signal)])
      .then((datas) => {
        dispatch({
          type: "SET_INSTANCES",
          payload: datas[0],
        });
        dispatch({ type: "SET_INTERRUPTIONS", payload: datas[1] });
        setisLoading(false);
        console.log(datas[0]);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          toast.error("An Error Occured");
        }
      });

    window.addEventListener("click", closeInterruptionDetails);
    return () => {
      controller.abort();
      window.removeEventListener("click", closeInterruptionDetails);
    };
  }, []);

  useEffect(() => {
    console.log("changing the search instances value");
    switch (filterby) {
      case "ended":
        setinstancesSearchResults(
          GLOBAL_STATE.shiftinstances.filter(
            (instance) => instance.endedshift === true
          )
        );
        break;
      case "notended":
        setinstancesSearchResults(
          GLOBAL_STATE.shiftinstances.filter(
            (instance) => instance.endedshift !== true
          )
        );
        break;
      default:
        setinstancesSearchResults(GLOBAL_STATE.shiftinstances);
        break;
    }
  }, [filterby, GLOBAL_STATE.shiftinstances]);

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
      {selected_shift.status === "opened" && (
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
      {selected_shift.status === "opened" && GLOBAL_STATE.addInterruption && (
        <AddInterruptionForm GLOBAL_STATE={GLOBAL_STATE} dispatch={dispatch} />
      )}
      {selected_shift.status === "opened" && GLOBAL_STATE.endShift && (
        <EndShiftForm GLOBAL_STATE={GLOBAL_STATE} dispatch={dispatch} />
      )}

      <div className="generalInfos">
        <div>Shift {selected_shift.type}</div>
        <div>
          Start On{" "}
          {DateTime.fromISO(selected_shift.startdate)
            .setLocale("fr")
            .toLocaleString({
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
        </div>
        <div>
          End On{" "}
          {DateTime.fromISO(selected_shift.enddate)
            .setLocale("fr")
            .toLocaleString({
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
        </div>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <h3>Workers</h3>
          {selected_shift.status === "closed" && (
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

                      {instance.operation ? (
                        <>
                          <div className="operationdetails">
                            <div>Operation Type</div>
                            <div>{instance.operation.type}</div>
                          </div>
                          {instance.operation.type === "navire" && (
                            <div className="operationdetails">
                              <div>Operation Vessel</div>
                              <div>{instance.operation.vessel}</div>
                            </div>
                          )}
                          <div className="operationdetails">
                            <div>Operation Position</div>
                            <div>{instance.operation.position}</div>
                          </div>
                        </>
                      ) : null}
                      {/* <div className="operationdetails">
                        <div>Operation Type</div>
                        <div> {instance.operation?.type}</div>
                      </div>
                      <div className="operationdetails">
                        <div>Operation Vessel</div>
                        <div>{instance.operation?.vessel}</div>
                      </div>
                      <div className="operationdetails">
                        <div>Operation Position</div>
                        <div>{instance.operation?.position}</div>
                      </div> */}
                    </div>
                    {instance.operation && (
                      <div className="operationdetails">
                        <div>Operation description</div>
                        <div>{instance.operation?.description}</div>
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
          {GLOBAL_STATE.interruptions.length > 0 ? (
            <div className="interruptionsgrid">
              {GLOBAL_STATE.interruptions.map((interruption) => {
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
                      <div className="interruptionTime">
                        {interruption.starttime} - {interruption.endtime}
                      </div>

                      <ul>
                        {interruption.instances?.map((instance) => (
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
        </>
      )}
    </Box>
  );
};

export default ShiftsDetails;
