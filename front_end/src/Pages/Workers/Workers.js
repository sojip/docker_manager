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
import { Button } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";

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
    // document.querySelector("body").style.overflowY = "hidden";
  };

  const handleClose = () => {
    setOpen(false);
    setaddWorker(false);
    setshowWorker(false);
    // document.querySelector("body").style.overflowY = "auto";
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
      ) : (
        <div className="noDatasInfos">No Workers ...</div>
      )}
      {/* {open && (
        <div className="modal">
          {addWorker && (
            <AddWorkerForm
              handleClose={handleClose}
              setisLoading={setisLoading}
              setworkers={setworkers}
            />
          )}
          {showWorker && (
            <WorkerDetails
              handleClose={handleClose}
              setisLoading={setisLoading}
              selected_id={selected_id}
            />
          )}
        </div>
      )} */}
      {open && (
        <>
          <Modal
            backdrop="static"
            show={addWorker}
            onHide={handleClose}
            // dialogAs={AddWorkerForm}
            // manager={modalManager}
            // scrollable={true}
          >
            {/* <Modal.Dialog> */}
            <AddWorkerForm
              handleClose={handleClose}
              setisLoading={setisLoading}
              setworkers={setworkers}
            />
            {/* </Modal.Dialog> */}
          </Modal>
          {/* </Modal> */}
          <Modal show={showWorker} onHide={handleClose}>
            <WorkerDetails
              handleClose={handleClose}
              setisLoading={setisLoading}
              selected_id={selected_id}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Workers;
