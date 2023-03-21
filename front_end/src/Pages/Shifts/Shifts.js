import "../../styles/Shifts.css";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiPlusCircle } from "@mdi/js";
import { useEffect, useState, createContext } from "react";
import StickyHeadTable from "./Table";
import AddShiftForm from "./AddShiftForm";
import ShiftDetails from "./ShiftDetails";
import { toast, ToastContainer } from "react-toastify";

export const ShiftsContext = createContext();
export const SelectedShiftContext = createContext();

const Shifts = (props) => {
  const { setisLoading } = props;
  const [shifts, setshifts] = useState([]);
  const [searchShiftsResults, setsearchShiftsResults] = useState([]);
  const [selected_shift, setselectedshift] = useState({});
  const [open, setOpen] = useState(false);
  const [addShift, setaddShift] = useState(false);
  const [showShift, setshowShift] = useState(false);
  let handleOpen = () => {
    setOpen(true);
    document.querySelector("body").style.overflowY = "hidden";
  };
  const handleClose = () => {
    setOpen(false);
    setaddShift(false);
    setshowShift(false);
    document.querySelector("body").style.overflowY = "auto";
  };

  function handleAddShiftClick(e) {
    handleOpen();
    setaddShift(true);
  }

  async function getShifts(signal) {
    const res = await fetch("/api/shifts", {
      signal: signal,
    });
    const datas = await res.json();
    return datas;
  }

  function handleSearch(e) {
    let date = e.target.value;
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
  }

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

  return (
    <ShiftsContext.Provider value={{ shifts, setshifts }}>
      <SelectedShiftContext.Provider
        value={{ selected_shift, setselectedshift }}
      >
        <div className="shiftsContainer">
          <h3>Shifts</h3>
          <div className="oulinedButtonWrapper" onClick={handleAddShiftClick}>
            <Icon path={mdiPlusCircle} size={1} />
            Start New Shift
          </div>
          <div className="searchWrapper">
            <TextField
              type="date"
              id="searchshift"
              helperText="Select A Date"
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleSearch}
            />
          </div>
          {searchShiftsResults.length > 0 ? (
            <div className="table">
              <StickyHeadTable
                shifts={searchShiftsResults}
                handleOpen={handleOpen}
                setshowShift={setshowShift}
              />
            </div>
          ) : (
            <div className="noDatasInfos">No Shifts ...</div>
          )}
          {open && (
            <div className="modal">
              <ToastContainer />
              {addShift && (
                <AddShiftForm
                  setisLoading={setisLoading}
                  handleClose={handleClose}
                />
              )}
              {showShift && (
                <ShiftDetails
                  setisLoading={setisLoading}
                  handleClose={handleClose}
                />
              )}
            </div>
          )}
        </div>
      </SelectedShiftContext.Provider>
    </ShiftsContext.Provider>
  );
};

export default Shifts;
