import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "../styles/ShiftDetails.css";
import { mdiPauseOctagonOutline, mdiAccountHardHatOutline } from "@mdi/js";
import { mdiCloseOctagonOutline } from "@mdi/js";
import {
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const ShiftsDetails = (props) => {
  const { handleClose } = props;
  const { selected_id } = props;
  const [shift, setshift] = useState({});
  const [shiftinstances, setshiftinstances] = useState([]);
  const [interruptions, setinterruptions] = useState([]);

  async function getShift() {
    const res = await fetch(`http://localhost:3000/api/shifts/${selected_id}`);
    const datas = await res.json();
    return datas;
  }

  async function getShiftInstances() {
    const res = await fetch(
      `http://localhost:3000/api/shifts/${selected_id}/workers`
    );
    const datas = await res.json();
    return datas;
  }

  async function getInterruptions() {
    const res = await fetch(
      `http://localhost:3000/api/shifts/${selected_id}/interruptions`
    );
    const datas = await res.json();
    console.log("interruptions");
    console.log(datas);
    return datas;
  }

  const handleAddInterruptionClick = () => {
    let open = document.querySelector(".open");
    if (open) open.classList.remove("open");
    let formWrapper = document.querySelector(".interruptionForm");
    formWrapper.classList.add("open");
  };
  const handleEndShiftClick = () => {
    let open = document.querySelector(".open");
    if (open) open.classList.remove("open");
    let formWrapper = document.querySelector(".endShiftFormWrapper");
    formWrapper.classList.add("open");
  };

  const handleCloseAddInterruptionForm = () => {
    let formWrapper = document.querySelector(".interruptionForm");
    let form = document.querySelector("#addInterruptionForm");
    formWrapper.classList.remove("open");
    form.reset();
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
  };

  const handleCloseEndShiftForm = () => {
    let formWrapper = document.querySelector(".endShiftFormWrapper");
    let form = document.querySelector("#endShiftForm");
    formWrapper.classList.remove("open");
    form.reset();
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
  };

  const handleCheckboxChange = (e) => {
    setshiftinstances(
      shiftinstances.map((instance) => {
        if (instance.docker._id === e.target.id)
          instance.checked = !instance.checked;
        return instance;
      })
    );
  };

  useEffect(() => {
    Promise.all([getShift(), getShiftInstances(), getInterruptions()]).then(
      (datas) => {
        setshift(datas[0]);
        setshiftinstances(
          datas[1].map((instance) => {
            return { ...instance, checked: false };
          })
        );
        setinterruptions(datas[2]);
      }
    );
  }, []);

  return (
    <Box
      id="showshiftbox"
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
      <div className="closeModalWrapper" id="closeModal" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>
      <h3>General</h3>
      <div className="callToActions">
        <div
          className="oulinedButtonWrapper"
          onClick={handleAddInterruptionClick}
        >
          <Icon path={mdiPauseOctagonOutline} size={1} />
          Add Interruption
        </div>
        <div className="oulinedButtonWrapper" onClick={handleEndShiftClick}>
          <Icon path={mdiCloseOctagonOutline} size={1} />
          Close Shift
        </div>
      </div>

      <AddInterruptionForm
        handleCloseAddInterruptionForm={handleCloseAddInterruptionForm}
        shiftinstances={shiftinstances}
        setshiftinstances={setshiftinstances}
        handleCheckboxChange={handleCheckboxChange}
        selected_id={selected_id}
        interruptions={interruptions}
        setinterruptions={setinterruptions}
      />

      <EndShiftForm
        handleCloseEndShiftForm={handleCloseEndShiftForm}
        shiftinstances={shiftinstances}
        setshiftinstances={setshiftinstances}
        handleCheckboxChange={handleCheckboxChange}
      />

      <div className="generalInfos">
        <div>Shift {shift.type}</div>
        <div>
          Start On{" "}
          {DateTime.fromISO(shift.startdate).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div>
          End On{" "}
          {DateTime.fromISO(shift.enddate).setLocale("fr").toLocaleString({
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
      <h3>Workers</h3>
      <div className="workersgrid">
        {shiftinstances.map((instance) => {
          return (
            <div key={instance.docker._id} className="workerItem">
              <div className="profileContainer">
                <Icon
                  id="workerIcon"
                  path={mdiAccountHardHatOutline}
                  size={2.5}
                />
                <div className="name">
                  <div>{instance.docker.firstname}</div>
                  <div>{instance.docker.lastname}</div>
                </div>
              </div>
              <div>
                Born On{" "}
                {DateTime.fromISO(instance.docker.dateofbirth)
                  .setLocale("fr")
                  .toLocaleString({
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <h3>Interruptions / Incidents</h3>
      {interruptions.length > 0 ? (
        <div className="interruptionsgrid">
          {interruptions.map((interruption) => {
            return (
              <div key={interruption._id} className="interruptionItem">
                <div>{interruption.description}</div>
                <div>Duration {interruption.duration} mins</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="noDatasInfos">No Interruptions / Incidents</div>
      )}
    </Box>
  );
};

const AddInterruptionForm = (props) => {
  const { handleCloseAddInterruptionForm } = props;
  const { handleCheckboxChange } = props;
  const { shiftinstances } = props;
  const { setshiftinstances } = props;
  const { selected_id } = props;
  const { interruptions } = props;
  const { setinterruptions } = props;
  const [datas, setdatas] = useState({});

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/api/interruptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...datas, shift: selected_id }),
    })
      .then((res) => res.json())
      .then((interruption) => {
        setinterruptions([...interruptions, interruption]);
        let selectedInstances = shiftinstances.filter(
          (instance) => instance.checked === true
        );
        return Promise.all(
          selectedInstances.map((instance) => {
            return updateInstancesInterruptions(instance, interruption);
          })
        );
      })
      .then((result) => {
        console.log(result);
        e.target.reset();
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
      })
      .catch((e) => alert(e));
  };

  async function updateInstancesInterruptions(instance, interruption) {
    const res = await fetch(
      `http://localhost:3000/api/shiftinstances/${instance._id}/interruptions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interruption: interruption._id,
        }),
      }
    );

    const datas = await res.json();
    return datas;
  }

  return (
    <div className="interruptionForm">
      <Box
        component="form"
        id="addInterruptionForm"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="closeForm" onClick={handleCloseAddInterruptionForm}>
          <Icon path={mdiCloseThick} size={1} />
        </div>
        <h2>Add Interruption</h2>
        <TextField
          onChange={handleChange}
          required
          label="Duration"
          id="duration"
          margin="normal"
          type="number"
          name="duration"
          sx={{ width: "25ch" }}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">mins</InputAdornment>,
          }}
        />
        <br />
        <TextField
          onChange={handleChange}
          fullWidth
          label="Description"
          id="description"
          name="description"
          margin="normal"
          multiline
          maxRows={4}
          required
        />
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Select Workers</FormLabel>
          {shiftinstances.map((instance) => {
            return (
              <FormGroup key={instance.docker._id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id={instance.docker._id}
                      onChange={handleCheckboxChange}
                      checked={instance.checked}
                    />
                  }
                  label={`${instance.docker.firstname} ${instance.docker.lastname}`}
                />
              </FormGroup>
            );
          })}
        </FormControl>
        <input type="submit" value="Save" />
      </Box>
    </div>
  );
};

const EndShiftForm = (props) => {
  const { handleCloseEndShiftForm } = props;
  const { shiftinstances } = props;
  const { handleCheckboxChange } = props;
  const { setshiftinstances } = props;

  async function endShift(instance) {
    const res = await fetch(
      `http://localhost:3000/api/shiftinstances/${instance._id}/shift`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    return data;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let selectedInstances = shiftinstances.filter(
      (instance) => instance.checked === true
    );
    Promise.all(
      selectedInstances.map((instance) => {
        return endShift(instance);
      })
    ).then((result) => {
      setshiftinstances(
        shiftinstances.map((instance) => {
          return { ...instance, checked: false };
        })
      );
      e.target.reset();
    });
  };
  return (
    <div className="endShiftFormWrapper">
      <Box
        component="form"
        id="endShiftForm"
        onSubmit={handleSubmit}
        novalidate
        autoComplete="off"
      >
        <div className="closeForm" onClick={handleCloseEndShiftForm}>
          <Icon path={mdiCloseThick} size={1} />
        </div>
        <h2>End Shift</h2>
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Select Workers</FormLabel>
          {shiftinstances.map((instance) => {
            return (
              <FormGroup key={instance.docker._id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id={instance.docker._id}
                      onChange={handleCheckboxChange}
                      checked={instance.checked}
                    />
                  }
                  label={`${instance.docker.firstname} ${instance.docker.lastname}`}
                />
              </FormGroup>
            );
          })}
        </FormControl>
        <br />
        <input type="submit" value="Save" />
      </Box>
    </div>
  );
};

export default ShiftsDetails;
