import "../../styles/Shifts.css";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiPlusCircle } from "@mdi/js";
import { useEffect, useState } from "react";
import StickyHeadTable from "./Table";
import AddShiftForm from "./AddShiftForm";
import ShiftDetails from "./ShiftDetails";
import alertify from "alertifyjs";

const Shifts = (props) => {
  const { setisLoading } = props;
  const [shifts, setshifts] = useState([]);
  const [searchShiftsResults, setsearchShiftsResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [addShift, setaddShift] = useState(false);
  const [showShift, setshowShift] = useState(false);
  const [selected_id, setselectedid] = useState("");
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
            new Date(shift.startdate).valueOf() === new Date(date).valueOf() ||
            new Date(shift.enddate).valueOf() === new Date(date).valueOf()
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
        setsearchShiftsResults(shifts);
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
  return (
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
            setselectedid={setselectedid}
          />
        </div>
      ) : (
        <div className="noDatasInfos">No Shifts ...</div>
      )}
      {open && (
        <div className="modal">
          {addShift && (
            <AddShiftForm
              handleClose={handleClose}
              setsearchShiftsResults={setsearchShiftsResults}
              shifts={shifts}
              setshifts={setshifts}
              setisLoading={setisLoading}
            />
          )}
          {showShift && (
            <ShiftDetails
              setisLoading={setisLoading}
              handleClose={handleClose}
              selected_id={selected_id}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Shifts;
