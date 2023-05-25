import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiPlusCircle } from "@mdi/js";
import { useEffect, useState, createContext } from "react";
import StickyHeadTable from "./Table";
import AddShiftForm from "./AddShiftForm";
import ShiftDetails from "./ShiftDetails";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import "../../styles/Shifts.css";

export const ShiftsContext = createContext();
export const SelectedShiftContext = createContext();

const Shifts = (props) => {
  const { setisLoading } = props;
  const [shifts, setshifts] = useState([]);
  const [searchShiftsResults, setsearchShiftsResults] = useState([]);
  const [selected_shift, setselectedshift] = useState({});
  const [searchdate, setsearchdate] = useState(null);
  const [addShift, setaddShift] = useState(false);
  const [showShift, setshowShift] = useState(false);

  let handleShowShiftClick = () => {
    setshowShift(true);
  };
  const handleClose = () => {
    setaddShift(false);
    setshowShift(false);
  };

  function handleAddShiftClick(e) {
    setaddShift(true);
  }

  async function getShifts(signal) {
    const res = await fetch("/api/shifts", {
      signal: signal,
    });
    const datas = await res.json();
    return datas;
  }

  const handleSearch = (date) => {
    if (date !== "") {
      let searchShiftsIds = shifts
        .map((shift) => {
          return {
            startdate: shift.startdate.split("T")[0],
            enddate: shift.enddate.split("T")[0],
            _id: shift._id,
          };
        })
        .filter((shift) => {
          return (
            new Date(shift.startdate).valueOf() >= new Date(date).valueOf() ||
            new Date(shift.enddate).valueOf() >= new Date(date).valueOf()
          );
        })
        .map((shift) => shift._id);

      return setsearchShiftsResults(
        shifts.filter((shift) => {
          return searchShiftsIds.includes(shift._id);
        })
      );
    }
    setsearchShiftsResults(shifts);
  };

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;
    getShifts(signal)
      .then((shifts) => {
        setshifts(shifts);
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          toast.error("An Error Occured");
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setsearchShiftsResults(shifts);
  }, [shifts]);

  useEffect(() => {
    if (searchdate !== null) {
      return handleSearch(searchdate);
    }
    setsearchShiftsResults(shifts);
  }, [searchdate]);

  return (
    <ShiftsContext.Provider value={{ shifts, setshifts }}>
      <SelectedShiftContext.Provider
        value={{ selected_shift, setselectedshift }}
      >
        <ToastContainer />
        <div className="shiftsContainer">
          <h3>Shifts</h3>
          <div className="oulinedButtonWrapper" onClick={handleAddShiftClick}>
            <Icon path={mdiPlusCircle} size={1} />
            Start New Shift
          </div>
          <div className="searchWrapper">
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <DatePicker
                label="Select A Date"
                placeholder="mm/dd/yyyy"
                value={searchdate}
                onChange={(newValue) => {
                  setsearchdate((date) => {
                    return newValue ? newValue.toJSDate() : null;
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
          {searchShiftsResults.length > 0 ? (
            <div className="table">
              <StickyHeadTable
                shifts={searchShiftsResults}
                handleOpen={handleShowShiftClick}
              />
            </div>
          ) : (
            <div className="noDatasInfos">No Shifts ...</div>
          )}
          <Modal
            backdrop="static"
            show={addShift}
            onHide={handleClose}
            contentClassName="content-wrapper addShift"
            fullscreen={true}
            scrollable
          >
            <Modal.Body>
              <AddShiftForm handleClose={handleClose} />
            </Modal.Body>
          </Modal>
          <Modal
            backdrop="static"
            show={showShift}
            onHide={handleClose}
            contentClassName="content-wrapper showShift"
            fullscreen={true}
            scrollable
          >
            <Modal.Body>
              <ShiftDetails handleClose={handleClose} />
            </Modal.Body>
          </Modal>
        </div>
      </SelectedShiftContext.Provider>
    </ShiftsContext.Provider>
  );
};

export default Shifts;
