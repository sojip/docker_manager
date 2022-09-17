import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import "../../styles/WorkerDetails.css";
import { DateTime, Interval } from "luxon";
import TextField from "@mui/material/TextField";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import { mdiPauseOctagon } from "@mdi/js";
import { mdiCheckboxMultipleMarked } from "@mdi/js";
import { mdiCheckboxMultipleBlank } from "@mdi/js";
import FormControlLabel from "@mui/material/FormControlLabel";
import { RadioGroup, Radio } from "@mui/material";

const WorkerDetails = (props) => {
  const [worker, setworker] = useState({
    firstname: "",
    lastname: "",
    fingerprint: "",
    createdOn: "",
    photo: "",
  });
  const [shifts, setshifts] = useState([]);
  const [searchresults, setsearchresults] = useState([]);
  const [filterby, setfilterby] = useState({
    from: "",
    to: "",
    option: "all",
  });
  const { handleClose } = props;
  const { selected_id } = props;
  const { setisLoading } = props;

  async function getWorker(id, signal) {
    const res = await fetch(`/api/workers/${id}`, {
      signal: signal,
    });
    const worker = await res.json();

    return worker;
  }

  async function getshifts(id, signal) {
    const res = await fetch(`/api/workers/${id}/shiftsinstances`, {
      signal: signal,
    });
    const shifts = await res.json();
    return shifts;
  }

  function handleSearchAndFilter(filter) {
    let dateFrom = filter.from;
    let dateTo = filter.to;
    let option = filter.option;
    //handle dateFrom is set - dateTo is set && dateFrom is set - dateTo is not set
    if (dateFrom !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
            shift: {
              startdate: shift.shift.startdate.split("T")[0],
              enddate: shift.shift.enddate.split("T")[0],
            },
            endedshift: shift.endedshift,
          };
        })
        .filter((shift) => {
          if (dateTo !== "") {
            let interval = Interval.fromDateTimes(
              DateTime.fromISO(dateFrom),
              DateTime.fromISO(dateTo).plus({ days: 1 })
            );
            return (
              interval.contains(DateTime.fromISO(shift.shift.startdate)) ||
              interval.contains(DateTime.fromISO(shift.shift.enddate))
            );
          }
          return (
            DateTime.fromISO(shift.shift.startdate) >=
              DateTime.fromISO(dateFrom) ||
            DateTime.fromISO(shift.shift.enddate) >= DateTime.fromISO(dateFrom)
          );
        }) //filter by option ["all", "ended", "notended"]
        .filter((shift) => {
          if (option === "ended") return shift.endedshift === true;
          if (option === "notended") return shift.endedshift !== true;
          return shift;
        })
        .map((shift) => shift._id);

      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      ); // handle dateTo only is set
    } else if (dateTo !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
            endedshift: shift.endedshift,
            shift: {
              startdate: shift.shift.startdate.split("T")[0],
              enddate: shift.shift.enddate.split("T")[0],
            },
          };
        })
        .filter((shift) => {
          return (
            DateTime.fromISO(shift.shift.startdate) <=
              DateTime.fromISO(dateTo) ||
            DateTime.fromISO(shift.shift.enddate) <= DateTime.fromISO(dateTo)
          );
        }) //filter by option ["all", "ended", "notended"]
        .filter((shift) => {
          if (option === "ended") return shift.endedshift === true;
          if (option === "notended") return shift.endedshift !== true;
          return shift;
        })
        .map((shift) => shift._id);
      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    }
    //fitler by option only
    let searchShiftsIds = shifts
      .filter((shift) => {
        if (option === "ended") return shift.endedshift === true;
        if (option === "notended") return shift.endedshift !== true;
        return shift;
      })
      .map((shift) => shift._id);

    return setsearchresults(
      shifts.filter((shift) => {
        return searchShiftsIds.includes(shift._id);
      })
    );
  }

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setfilterby({ ...filterby, [name]: value });
  };

  const handleFilterOptionsClick = (e) => {
    setfilterby({ ...filterby, option: e.target.value });
  };

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;
    Promise.all([
      getWorker(selected_id, signal),
      getshifts(selected_id, signal),
    ])
      .then((datas) => {
        setworker(datas[0]);
        setshifts(datas[1]);
        setsearchresults(datas[1]);
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          alertify.error("An Error Occured");
          alert(e);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    handleSearchAndFilter(filterby);
  }, [filterby]);

  return (
    <Box
      id="showworkerbox"
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

      <div className="workerGeneralInfos">
        <div>
          {worker.photo !== "" && worker.photo !== undefined && (
            <div className="photoContainer">
              <img src={worker.photo} alt="" />
            </div>
          )}
          <div>
            <div>{worker.firstname}</div>
            <div>{worker.lastname}</div>
            <div>
              Born on{" "}
              {DateTime.fromISO(worker.dateofbirth)
                .setLocale("fr")
                .toLocaleString({
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </div>
            {worker.cni && <div>CNI N° {worker.cni}</div>}
            {worker.position && (
              <div style={{ fontStyle: "italic" }}>{worker.position}</div>
            )}
          </div>
        </div>
        <div className="fingerprintcontainer">FINGERPRINT</div>

        <div style={{ fontStyle: "italic", position: "absolute", bottom: "0" }}>
          Created On{" "}
          {DateTime.fromISO(worker.createdOn).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
      <h3>Shifts</h3>
      <div className="findshifts">
        <div>
          <div>From</div>
          <TextField
            type="date"
            id="searchshiftstart"
            helperText="Select A Date"
            variant="outlined"
            fullWidth
            margin="normal"
            name="from"
            onChange={handleChange}
          />
        </div>
        <div>
          <div>To</div>
          <TextField
            type="date"
            id="searchshiftend"
            helperText="Select A Date"
            variant="outlined"
            fullWidth
            margin="normal"
            name="to"
            onChange={handleChange}
          />
        </div>
      </div>
      <RadioGroup
        row
        aria-labelledby="radio-buttons-group-label"
        name="radio-buttons-group"
        onChange={handleFilterOptionsClick}
        value={filterby.option}
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
          label="Ended"
          labelPlacement="start"
        />
        <FormControlLabel
          value="notended"
          control={<Radio />}
          label="Not Ended"
          labelPlacement="start"
        />
      </RadioGroup>
      {searchresults.length > 0 ? (
        <div>
          <div className="workerstats">Total Shifts {searchresults.length}</div>
          <div className="workerstats">
            Total Time Worked{" "}
            {searchresults
              .filter((shift) => shift.endedshift === true)
              .reduce((total, shift) => {
                if (!shift.interruptions) return total + shift.shift.duration;
                return (
                  total +
                  shift.shift.duration -
                  shift.interruptions.reduce(
                    (total_, current) => total_ + current.duration,
                    0
                  )
                );
              }, 0)}{" "}
            mins
          </div>
          <div className="shiftsgrid">
            {searchresults.map((shift) => {
              return (
                <div className="shiftItem" key={shift._id}>
                  <div>Shift {shift.shift.type}</div>
                  <div className="shiftItemgrid">
                    <div>
                      Shift Start Date{" "}
                      {DateTime.fromISO(shift.shift.startdate)
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
                      Shift End Date{" "}
                      {DateTime.fromISO(shift.shift.enddate)
                        .setLocale("fr")
                        .toLocaleString({
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                    </div>
                    <div className="startedshift">
                      Started shift{" "}
                      {shift.startedshift ? (
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
                      {shift.endedshift ? (
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
                    {shift.operation && shift.operation.type && (
                      <div>Operation Type {shift.operation.type}</div>
                    )}
                    {shift.operation && shift.operation.vessel && (
                      <div>Operation Vessel {shift.operation.vessel}</div>
                    )}
                    {shift.operation && shift.operation.position && (
                      <div>Operation Position {shift.operation.position}</div>
                    )}
                    {shift.operation && shift.operation.description && (
                      <div>
                        Operation Description <br />{" "}
                        {shift.operation.description}
                      </div>
                    )}
                  </div>
                  {shift.startedshift &&
                    shift.endedshift &&
                    shift.interruptions && (
                      <div className="timeworked">
                        Time Worked{" "}
                        {shift.shift.duration -
                          shift.interruptions.reduce(
                            (total, current) => total + current.duration,
                            0
                          )}{" "}
                        mins
                      </div>
                    )}
                  {shift.startedshift &&
                    shift.endedshift &&
                    !shift.interruptions && (
                      <div className="timeworked">
                        Time Worked {shift.shift.duration} mins
                      </div>
                    )}
                  {shift.startedshift && !shift.endedshift && (
                    <div className="timeworked">Shift Not Ended</div>
                  )}
                  {shift.interruptions !== undefined &&
                  shift.interruptions.length ? (
                    <div>
                      <div style={{ marginTop: "5px", fontWeight: "bold" }}>
                        INTERRUPTIONS - INCIDENTS
                      </div>
                      <ul className="shiftinterruptionsList">
                        {shift.interruptions.map((interruption) => {
                          return (
                            <li key={interruption._id}>
                              <Icon path={mdiPauseOctagon} size={1} />
                              <div>
                                <div>{interruption.duration} mins</div>
                                <div style={{ marginTop: "5px" }}>
                                  {interruption.description}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div
                      className="noDatasInfos"
                      style={{ textAlign: "right" }}
                    >
                      No Interruptions - Incidents ...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="noDatasInfos">No Shifts ...</div>
      )}
    </Box>
  );
};

export default WorkerDetails;
