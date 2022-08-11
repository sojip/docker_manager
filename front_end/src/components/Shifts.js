import "../styles/Shifts.css";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiPlusCircle } from "@mdi/js";
import { useEffect, useState } from "react";
import StickyHeadTable from "./Table";

const Shifts = () => {
  const [shifts, setshifts] = useState([]);
  const [searchShiftsResults, setsearchShiftsResults] = useState([]);

  async function getShifts() {
    const res = await fetch("http://localhost:3000/api/shifts");
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
    getShifts().then((shifts) => {
      setshifts(shifts);
      setsearchShiftsResults(shifts);
    });
  }, []);
  return (
    <div className="shiftsContainer">
      <h3>Shifts</h3>
      <div className="oulinedButtonWrapper">
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
          <StickyHeadTable shifts={searchShiftsResults} />
        </div>
      ) : (
        <div className="noDatasInfos">No Shifts ...</div>
      )}
    </div>
  );
};

export default Shifts;
