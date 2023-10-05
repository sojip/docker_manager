import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiAccountPlusOutline } from "@mdi/js";
import AddWorkerForm from "./AddWorkerForm";
import WorkerDetails from "./WorkerDetails";
import TextField from "@mui/material/TextField";
import { useAuthContext } from "../../auth/useAuthContext";
import { useLoadingContext } from "../../App";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import { WorkerItem } from "./WorkerItem";
import "../../styles/Workers.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Workers = () => {
  const setisLoading = useLoadingContext();
  const { user } = useAuthContext();
  let [workers, setworkers] = useState([]);
  const [searchWorkersResults, setsearchWorkersResults] = useState([]);
  const [addWorker, setaddWorker] = useState(false);
  const [showWorkerDetails, setshowWorkerDetails] = useState(false);
  const [selected_id, setselected] = useState("");

  const handleClose = () => {
    setaddWorker(false);
    setshowWorkerDetails(false);
  };

  const handleAddWorkerClick = (e) => {
    setaddWorker(true);
  };

  const handleWorkerCardClick = (e) => {
    setselected(e.currentTarget.id);
    setshowWorkerDetails(true);
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
        Authorization: `Bearer ${user.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((workers) => {
        setworkers(workers);
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          toast.error(e.message);
          setisLoading(false);
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
              <WorkerItem
                key={worker._id}
                worker={worker}
                handleWorkerCardClick={handleWorkerCardClick}
              />
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
        show={showWorkerDetails}
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
