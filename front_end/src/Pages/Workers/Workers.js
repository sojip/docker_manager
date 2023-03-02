import Icon from "@mdi/react";
import { mdiAccountPlusOutline } from "@mdi/js";
import { mdiAccountHardHatOutline } from "@mdi/js";
import "../../styles/Workers.css";
import { useState, useEffect } from "react";
import AddWorkerForm from "./AddWorkerForm";
import WorkerDetails from "./WorkerDetails";
import TextField from "@mui/material/TextField";
import { DateTime } from "luxon";
import useAuthContext from "../../auth/useAuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Workers = (props) => {
  const { setisLoading } = props;
  const auth = useAuthContext();
  let [workers, setworkers] = useState([]);
  const [selected_id, setselectedid] = useState("");
  const [searchWorkersResults, setsearchWorkersResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [addWorker, setaddWorker] = useState(false);
  const [showWorker, setshowWorker] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    document.querySelector("body").style.overflowY = "hidden";
  };

  const handleClose = () => {
    setOpen(false);
    setaddWorker(false);
    setshowWorker(false);
    document.querySelector("body").style.overflowY = "auto";
    setselectedid("");
  };

  function handleAddWorkerClick() {
    handleOpen();
    setaddWorker(true);
  }

  function handleShowWorkerClick(e) {
    handleOpen();
    setshowWorker(true);
    setselectedid(e.currentTarget.id);
  }

  async function getWorkers(signal) {
    let workers = [];
    try {
      const res = await fetch("/api/workers", {
        signal: signal,
        headers: {
          Authorization: `Bearer ${auth.user.access_token}`,
        },
      });
      workers = await res.json();
    } catch (e) {
      if (e.name !== "AbortError") throw new Error("Can't Fetch Workers");
    }
    return workers;
  }

  let search = (arr, str) => {
    return arr.filter((x) =>
      [x.firstname, x.lastname, x.cni]
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

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;

    getWorkers(signal)
      .then((workers) => {
        setworkers(workers);
        setsearchWorkersResults(workers);
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

  return (
    <div className="workerscontainer">
      <ToastContainer />
      <h3>Workers</h3>
      <div className="oulinedButtonWrapper" onClick={handleAddWorkerClick}>
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
                  onClick={handleShowWorkerClick}
                >
                  <div className="profileContainer">
                    <Icon
                      className="workerIcon"
                      path={mdiAccountHardHatOutline}
                      size={2.5}
                    />
                    <div className="name">
                      <div>{worker.firstname}</div>
                      <div>{worker.lastname}</div>
                    </div>
                  </div>
                  <div>
                    Born On{" "}
                    {DateTime.fromISO(worker.dateofbirth)
                      .setLocale("fr")
                      .toLocaleString({
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </div>
                  {worker.cni && <div>CNI N° {worker.cni}</div>}
                  <div className="seemore">See More</div>
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
          {addWorker && (
            <AddWorkerForm
              handleClose={handleClose}
              workers={workers}
              setworkers={setworkers}
              setsearchWorkersResults={setsearchWorkersResults}
              setisLoading={setisLoading}
            />
          )}
          {showWorker && (
            <WorkerDetails
              handleClose={handleClose}
              selected_id={selected_id}
              setisLoading={setisLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Workers;
