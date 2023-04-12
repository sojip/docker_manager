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
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";

const Workers = (props) => {
  const { setisLoading } = props;
  const auth = useAuthContext();
  let [workers, setworkers] = useState([]);
  const [searchWorkersResults, setsearchWorkersResults] = useState([]);
  const [addWorker, setaddWorker] = useState(false);
  const [showWorker, setshowWorker] = useState(false);
  const [selected_id, setselected] = useState("");

  const handleClose = () => {
    setaddWorker(false);
    setshowWorker(false);
  };

  const handleAddWorkerClick = (e) => {
    setaddWorker(true);
  };

  const handleWorkerCardClick = (e) => {
    setselected(e.currentTarget.id);
    setshowWorker(true);
  };

  let search = (arr, str) => {
    return arr.filter((el) =>
      [el.firstname, el.lastname, el.cni]
        .join(" ")
        .toLowerCase()
        .includes(str.toLowerCase())
    );
  };

  function handleSearch(e) {
    let value =
      e?.target.value || document.querySelector("#searchworker").value;
    if (value !== "") {
      return setsearchWorkersResults(search(workers, value));
    }
    setsearchWorkersResults(workers);
  }

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;

    fetch("/api/workers", {
      signal: signal,
      headers: {
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((workers) => {
        setworkers(workers);
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

  useEffect(() => {
    handleSearch();
  }, [workers]);

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
        <div className="workersGrid">
          {searchWorkersResults.map((worker) => {
            return (
              <div
                className="workerCard"
                key={worker._id}
                id={worker._id}
                onClick={handleWorkerCardClick}
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
      ) : (
        <div className="noDatasInfos">No Workers ...</div>
      )}
      <Modal
        backdrop="static"
        show={addWorker}
        contentClassName="content-wrapper addWorker"
      >
        <AddWorkerForm handleClose={handleClose} setworkers={setworkers} />
      </Modal>
      <Modal
        backdrop="static"
        show={showWorker}
        contentClassName="content-wrapper showWorker"
        fullscreen={true}
        scrollable
      >
        <Modal.Body>
          <WorkerDetails handleClose={handleClose} id={selected_id} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Workers;
