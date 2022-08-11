import Icon from "@mdi/react";
import { mdiAccountPlusOutline } from "@mdi/js";
import "../styles/Workers.css";
import { useState, useEffect } from "react";
import AddWorkerForm from "./AddWorkerForm";
import TextField from "@mui/material/TextField";

const Workers = () => {
  const [workers, setworkers] = useState([]);
  const [searchWorkersResults, setsearchWorkersResults] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  async function getWorkers() {
    const res = await fetch("http://localhost:3000/api/workers");
    const workers = await res.json();
    return workers;
  }

  let search = (arr, str) => {
    return arr.filter((x) =>
      [x.firstname, x.lastname]
        .join(" ")
        .toLowerCase()
        .includes(str.toLowerCase())
    );
  };

  function handleSearch(e) {
    let value = e.target.value;
    if (value !== "") {
      return setsearchWorkersResults(search(workers, value));
    }
    setsearchWorkersResults(workers);
  }

  function handleSelection(e) {
    console.log(e.currentTarget);
  }

  useEffect(() => {
    getWorkers().then((workers) => {
      setworkers(workers);
      setsearchWorkersResults(workers);
    });
  }, []);

  return (
    <div className="workerscontainer">
      <h3>Workers</h3>
      <div className="oulinedButtonWrapper" onClick={handleOpen}>
        <Icon path={mdiAccountPlusOutline} size={1} />
        Add Worker
      </div>
      <div className="searchWrapper">
        <TextField
          id="searchworker"
          name="searchworker"
          label="Search"
          variant="outlined"
          type="search"
          margin="normal"
          fullWidth
          onChange={handleSearch}
        />
      </div>
      {searchWorkersResults.length > 0 ? (
        <>
          <div className="workersGrid">
            {searchWorkersResults.map((worker) => {
              return (
                <div
                  className="workerCard"
                  key={worker._id}
                  id={worker._id}
                  onClick={handleSelection}
                >
                  <div className="profileContainer"></div>
                  <div className="cardInfos">
                    <div className="cardtitle">First Name</div>
                    <div>{worker.firstname}</div>
                    <div className="cardtitle">Last Name</div>
                    <div>{worker.lastname}</div>
                    <div className="cardtitle">Finger Print</div>
                    <div>{worker.fingerprint}</div>
                    <div className="seemore">See More</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="noDatasInfos">No Workers ...</div>
      )}
      {open && (
        <div className="modal">
          <AddWorkerForm handleClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default Workers;
