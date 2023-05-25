import { useEffect, useState } from "react";
import { DateTime, Interval } from "luxon";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { mdiPauseOctagon } from "@mdi/js";
import { mdiCheckboxMultipleMarked } from "@mdi/js";
import { mdiCheckboxMultipleBlank } from "@mdi/js";
import FormControlLabel from "@mui/material/FormControlLabel";
import { RadioGroup, Radio } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { Spinner } from "../../components/Spinner";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import FingerPrint from "../../img/fingerprint.jpg";
import "../../styles/WorkerDetails.css";

const WorkerDetails = (props) => {
  const { id, handleClose } = props;
  const [isLoading, setisLoading] = useState(true);
  const [worker, setworker] = useState({
    firstname: "",
    lastname: "",
    position: "",
    photo: "",
    cni: "",
    dateofbirth: "",
    fingerprint: "",
    createdOn: "",
  });
  const [shiftsinstances, setshiftsinstances] = useState([]);
  const [searchresults, setsearchresults] = useState([]);
  const [filterby, setfilterby] = useState({
    from: null,
    to: null,
    option: "all",
  });

  async function getWorker(id, signal) {
    const res = await fetch(`/api/workers/${id}`, {
      signal: signal,
    });
    const worker = await res.json();

    return worker;
  }

  async function getshiftsinstances(id, signal) {
    const res = await fetch(`/api/workers/${id}/shiftsinstances`, {
      signal: signal,
    });
    const shiftsinstances = await res.json();
    return shiftsinstances;
  }

  useEffect(() => {
    let controller = new AbortController();
    let signal = controller.signal;
    Promise.all([getWorker(id, signal), getshiftsinstances(id, signal)])
      .then((datas) => {
        setworker(datas[0]);
        setshiftsinstances(datas[1]);
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          toast.error(e.message);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  function handleSearchAndFilter(filter) {
    let dateFrom = filter.from;
    let dateTo = filter.to;
    let option = filter.option;
    //handle dateFrom is set - dateTo is set && dateFrom is set - dateTo is not set
    if (dateFrom !== null) {
      let shiftsinstancesIds = shiftsinstances
        .map((instance) => {
          return {
            _id: instance._id,
            shift: {
              startdate: instance.shift.startdate.split("T")[0],
              enddate: instance.shift.enddate.split("T")[0],
            },
            endedshift: instance.endedshift,
          };
        })
        .filter((instance) => {
          if (dateTo !== null) {
            let interval = Interval.fromDateTimes(
              DateTime.fromJSDate(dateFrom),
              DateTime.fromJSDate(dateTo).plus({ days: 1 })
            );
            return (
              interval.contains(DateTime.fromISO(instance.shift.startdate)) ||
              interval.contains(DateTime.fromISO(instance.shift.enddate))
            );
          }
          return (
            DateTime.fromISO(instance.shift.startdate) >=
              DateTime.fromJSDate(dateFrom) ||
            DateTime.fromISO(instance.shift.enddate) >=
              DateTime.fromJSDate(dateFrom)
          );
        }) //filter by option ["all", "ended", "notended"]
        .filter((instance) => {
          if (option === "ended") return instance.endedshift === true;
          if (option === "notended") return instance.endedshift !== true;
          return instance;
        })
        .map((instance) => instance._id);

      return setsearchresults(
        shiftsinstances.filter((instance) => {
          return shiftsinstancesIds.includes(instance._id);
        })
      ); // handle dateTo only is set
    } else if (dateTo !== null) {
      let shiftsinstancesIds = shiftsinstances
        .map((instance) => {
          return {
            _id: instance._id,
            endedshift: instance.endedshift,
            shift: {
              startdate: instance.shift.startdate.split("T")[0],
              enddate: instance.shift.enddate.split("T")[0],
            },
          };
        })
        .filter((instance) => {
          return (
            DateTime.fromISO(instance.shift.startdate) <=
              DateTime.fromJSDate(dateTo) ||
            DateTime.fromISO(instance.shift.enddate) <=
              DateTime.fromJSDate(dateTo)
          );
        }) //filter by option ["all", "ended", "notended"]
        .filter((instance) => {
          if (option === "ended") return instance.endedshift === true;
          if (option === "notended") return instance.endedshift !== true;
          return instance;
        })
        .map((instance) => instance._id);
      return setsearchresults(
        shiftsinstances.filter((instance) => {
          return shiftsinstancesIds.includes(instance._id);
        })
      );
    }
    //fitler by option only
    let shiftsinstancesIds = shiftsinstances
      .filter((instance) => {
        if (option === "ended") return instance.endedshift === true;
        if (option === "notended") return instance.endedshift !== true;
        return instance;
      })
      .map((instance) => instance._id);

    return setsearchresults(
      shiftsinstances.filter((instance) => {
        return shiftsinstancesIds.includes(instance._id);
      })
    );
  }

  useEffect(() => {
    handleSearchAndFilter(filterby);
    console.log(filterby);
  }, [filterby, shiftsinstances]);

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setfilterby({ ...filterby, [name]: value });
  };

  return (
    <>
      <ToastContainer />
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
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div
              className="closeModalWrapper"
              id="closeModal"
              onClick={handleClose}
            >
              <Icon path={mdiCloseThick} size={1} />
            </div>
            <h3>General</h3>

            <div className="workerGeneralInfos">
              <div>
                <div className="photoContainer">
                  <img src={worker.photo} alt="" />
                </div>
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
                  <div>CNI N° {worker.cni}</div>
                  <div style={{ fontStyle: "italic" }}>{worker.position}</div>
                </div>
              </div>
              <div className="fingerprintcontainer">
                <img src={FingerPrint} alt="" />
              </div>

              <div
                style={{
                  fontStyle: "italic",
                  position: "absolute",
                  bottom: "0",
                }}
              >
                Created On{" "}
                {DateTime.fromISO(worker.createdOn)
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
            <h3>Shifts</h3>
            <div className="findshifts">
              <div>
                <div>From</div>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <DatePicker
                    label="Start Date"
                    placeholder="mm/dd/yyyy"
                    value={filterby.from}
                    onChange={(newValue) => {
                      setfilterby({
                        ...filterby,
                        from: newValue ? newValue.toJSDate() : null,
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        margin="normal"
                        fullWidth
                        {...params}
                        helperText={"mm/dd/yyyy"}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
              <div>
                <div>To</div>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <DatePicker
                    label="End Date"
                    placeholder="mm/dd/yyyy"
                    value={filterby.to}
                    onChange={(newValue) => {
                      setfilterby({
                        ...filterby,
                        to: newValue ? newValue.toJSDate() : null,
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        margin="normal"
                        fullWidth
                        {...params}
                        helperText={"mm/dd/yyyy"}
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <RadioGroup
              row
              aria-labelledby="radio-buttons-group-label"
              name="option"
              onChange={handleChange}
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
                <div className="workerstats">
                  Total Shifts {searchresults.length}
                </div>
                <div className="workerstats">
                  Total Time Worked{" "}
                  {searchresults
                    .filter((instance) => instance.endedshift === true)
                    .reduce((total, instance) => {
                      if (!instance.interruptions)
                        return total + instance.shift.duration;
                      return (
                        total +
                        instance.shift.duration -
                        instance.interruptions.reduce(
                          (total_, current) => total_ + current.duration,
                          0
                        )
                      );
                    }, 0)}{" "}
                  mins
                </div>
                <div className="shiftsgrid">
                  {searchresults.map((instance) => {
                    return (
                      <div className="shiftItem" key={instance._id}>
                        <div>Shift {instance.shift.type}</div>
                        <div className="shiftItemgrid">
                          <div>
                            Shift Start Date{" "}
                            {DateTime.fromISO(instance.shift.startdate)
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
                            {DateTime.fromISO(instance.shift.enddate)
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
                              <div>
                                Operation Type {instance.operation?.type}
                              </div>
                              {instance.operation.type === "navire" && (
                                <div>
                                  Operation Vessel {instance.operation?.vessel}
                                </div>
                              )}
                              <div>
                                Operation Position{" "}
                                {instance.operation?.position}
                              </div>
                              <div>
                                Operation Description <br />{" "}
                                {instance.operation?.description}
                              </div>
                            </>
                          ) : null}
                        </div>
                        {instance.endedshift ? (
                          instance.interruptions ? (
                            <div className="timeworked">
                              Time Worked{" "}
                              {instance.shift.duration -
                                instance.interruptions.reduce(
                                  (total, current) => total + current.duration,
                                  0
                                )}{" "}
                              mins
                            </div>
                          ) : (
                            <div className="timeworked">
                              Time Worked {instance.shift.duration} mins
                            </div>
                          )
                        ) : (
                          <div className="timeworked">Shift Not Ended</div>
                        )}

                        {instance.interruptions?.length > 0 ? (
                          <>
                            <div
                              style={{ marginTop: "5px", fontWeight: "bold" }}
                            >
                              INTERRUPTIONS - INCIDENTS
                            </div>
                            <ul className="shiftinterruptionsList">
                              {instance.interruptions.map((interruption) => {
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
                          </>
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
          </>
        )}
      </Box>
    </>
  );
};

export default WorkerDetails;
