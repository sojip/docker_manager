import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import "../styles/WorkerDetails.css";
import { DateTime, Interval } from "luxon";
import TextField from "@mui/material/TextField";

const WorkerDetails = (props) => {
  const [worker, setworker] = useState({
    firstname: "",
    lastname: "",
    fingerprint: "",
    createdOn: "",
  });
  const [shifts, setshifts] = useState([]);
  const [searchresults, setsearchresults] = useState([]);

  const { handleClose } = props;
  const { selected_id } = props;

  async function getWorker(id) {
    const res = await fetch(`http://localhost:3000/api/workers/${id}`);
    const worker = await res.json();
    return worker;
  }

  async function getshifts(id) {
    const res = await fetch(`http://localhost:3000/api/workers/${id}/shifts`);
    const shifts = await res.json();
    return shifts;
  }

  function handleSearchFrom(e) {
    let dateFrom = e.target.value;
    let dateTo = document.querySelector("#searchshiftend").value;
    if (dateFrom !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
            shift: {
              startdate: shift.shift.startdate.split("T")[0],
              enddate: shift.shift.enddate.split("T")[0],
            },
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
        })
        .map((shift) => shift._id);

      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    } else if (dateTo !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
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
        })
        .map((shift) => shift._id);
      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    }
    return setsearchresults(shifts);
  }

  function handleSearchTo(e) {
    let dateTo = e.target.value;
    let dateFrom = document.querySelector("#searchshiftstart").value;
    if (dateTo !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
            shift: {
              startdate: shift.shift.startdate.split("T")[0],
              enddate: shift.shift.enddate.split("T")[0],
            },
          };
        })
        .filter((shift) => {
          if (dateFrom !== "") {
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
            DateTime.fromISO(shift.shift.startdate) <=
              DateTime.fromISO(dateTo) ||
            DateTime.fromISO(shift.shift.enddate) <= DateTime.fromISO(dateTo)
          );
        })
        .map((shift) => shift._id);

      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    } else if (dateFrom !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            _id: shift._id,
            shift: {
              startdate: shift.shift.startdate.split("T")[0],
              enddate: shift.shift.enddate.split("T")[0],
            },
          };
        })
        .filter((shift) => {
          return (
            DateTime.fromISO(shift.shift.startdate) >=
              DateTime.fromISO(dateFrom) ||
            DateTime.fromISO(shift.shift.enddate) >= DateTime.fromISO(dateFrom)
          );
        })
        .map((shift) => shift._id);
      return setsearchresults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    }
    return setsearchresults(shifts);
  }

  useEffect(() => {
    Promise.all([getWorker(selected_id), getshifts(selected_id)]).then(
      (datas) => {
        console.log(datas[1]);
        setworker(datas[0]);
        setshifts(datas[1]);
        setsearchresults(datas[1]);
      }
    );
  }, []);

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
        <div className="fingerprintcontainer">FINGERPRINT</div>
        <div>{worker.firstname}</div>
        <div>{worker.lastname}</div>
        <div>
          Born on{" "}
          {DateTime.fromISO(worker.dateofbirth).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
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
            onChange={handleSearchFrom}
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
            onChange={handleSearchTo}
          />
        </div>
      </div>
      {searchresults.length > 0 ? (
        <div>
          <div className="workerstats">Total Shifts {searchresults.length}</div>
          <div className="workerstats">
            Total Time Worked{" "}
            {searchresults.reduce((total, shift) => {
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
                  <div>
                    Started on{" "}
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
                    Ended on{" "}
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
                  <div>
                    Started shift{" "}
                    <input
                      type="checkbox"
                      disabled
                      checked={shift.startedshift}
                    />
                  </div>
                  <div>
                    Ended shift
                    <input
                      type="checkbox"
                      disabled
                      checked={shift.endedshift}
                    />{" "}
                  </div>
                  {shift.interruptions ? (
                    <div className="timeworked">
                      Time Worked{" "}
                      {shift.shift.duration -
                        shift.interruptions.reduce(
                          (total, current) => total + current.duration,
                          0
                        )}{" "}
                      mins
                    </div>
                  ) : (
                    <div className="timeworked">
                      Time Worked {shift.shift.duration} mins
                    </div>
                  )}
                  {shift.interruptions ? (
                    <>
                      <div>Interruptions / Incidents</div>
                      <ul>
                        {shift.interruptions.map((interruption) => {
                          return (
                            <li key={interruption._id}>
                              <div>{interruption.description}</div>
                              <div>Duration {interruption.duration} mins</div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <div className="noDatasInfos">
                      No Interruptions / Incidents ...
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
