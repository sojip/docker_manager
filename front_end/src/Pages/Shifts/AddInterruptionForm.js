import { useState, useContext, useRef } from "react";
import Box from "@mui/material/Box";
import Icon from "@mdi/react";
import { mdiCloseThick, mdiInboxOutline } from "@mdi/js";
import {
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DateTime, Interval } from "luxon";
import { toast } from "react-toastify";
import { SelectedShiftContext } from "./Shifts";

const AddInterruptionForm = (props) => {
  const { selected_shift } = useContext(SelectedShiftContext);
  const { GLOBAL_STATE, dispatch } = props;
  const { setisLoading } = props;
  const [shiftinstances, setshiftinstances] = useState(
    GLOBAL_STATE.shiftinstances.map((instance) => {
      return { ...instance, checked: false };
    })
  );
  const [datas, setdatas] = useState({});
  const selectall = useRef();
  const shifttime =
    selected_shift.type === "jour"
      ? { startat: "07:00", endat: "19:00" }
      : {
          startat: "19:00",
          endat: "07:00",
        };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
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

  async function updateInstancesInterruptions(instance, interruption) {
    const res = await fetch(
      `/api/shiftinstances/${instance._id}/interruptions`,
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

  const handleSelectAll = (e) => {
    let checked = e.target.checked;
    if (checked) {
      setshiftinstances(
        shiftinstances.map((instance) => {
          return { ...instance, checked: true };
        })
      );
      return;
    }
    setshiftinstances(
      shiftinstances.map((instance) => {
        return { ...instance, checked: false };
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //Verify that a user has been selected
    let selectedInstances = shiftinstances.filter(
      (instance) => instance.checked === true
    );
    if (selectedInstances.length === 0) {
      alert("select user please");
      return;
    }
    setisLoading(true);
    let interruptionStartDate;
    let interruptionEndDate;
    if (selected_shift.type === "jour") {
      interruptionStartDate = new Date(selected_shift.startdate.split("T")[0]);
      interruptionEndDate = new Date(selected_shift.startdate.split("T")[0]);
    }
    if (selected_shift.type === "nuit") {
      let beforeMidnightHours = [19, 20, 21, 22, 23];
      beforeMidnightHours.includes(Number(datas.starttime.split(":")[0]))
        ? (interruptionStartDate = new Date(
            selected_shift.startdate.split("T")[0]
          ))
        : (interruptionStartDate = new Date(
            selected_shift.enddate.split("T")[0]
          ));
      beforeMidnightHours.includes(Number(datas.endtime.split(":")[0]))
        ? (interruptionEndDate = new Date(
            selected_shift.startdate.split("T")[0]
          ))
        : (interruptionEndDate = new Date(
            selected_shift.enddate.split("T")[0]
          ));
    }
    interruptionStartDate.setHours(
      Number(datas.starttime.split(":")[0]),
      Number(datas.starttime.split(":")[1])
    );
    interruptionEndDate.setHours(
      Number(datas.endtime.split(":")[0]),
      Number(datas.endtime.split(":")[1])
    );

    if (interruptionEndDate <= interruptionStartDate) {
      setisLoading(false);
      alert("End Time should be after the Start Time");
      return;
    }

    let interruptionInterval = Interval.fromDateTimes(
      DateTime.fromJSDate(interruptionStartDate),
      DateTime.fromJSDate(interruptionEndDate)
    )
      .toDuration("minutes")
      .toObject();
    fetch("/api/interruptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...datas,
        shift: selected_shift._id,
        duration: interruptionInterval.minutes,
      }),
    })
      .then((res) => res.json())
      .then((interruption) => {
        let selectedInstances = shiftinstances.filter(
          (instance) => instance.checked === true
        );
        return Promise.all([
          ...selectedInstances.map((instance) => {
            return updateInstancesInterruptions(instance, interruption);
          }),
          interruption,
        ]);
      })
      .then((result) => {
        let interruption = result[result.length - 1];
        interruption.instances = result.slice(0, -1);
        dispatch({ type: "PUSH_INTERRUPTION", payload: interruption });
        toast.success("New Interruption Added Succesffully");
        setisLoading(false);
        e.target.reset();
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
      })
      .catch((e) => {
        setisLoading(false);
        toast.error("An Error Occured");
        console.log(e);
      });
  };

  return (
    <div className="interruptionForm">
      <Box
        component="form"
        id="addInterruptionForm"
        autoComplete="off"
        onSubmit={handleSubmit}
        className="shiftDetailsForm"
      >
        <div
          className="closeForm"
          onClick={() => {
            dispatch({ type: "TOGGLE_INTERRUPTION_FORM", payload: false });
          }}
        >
          <Icon path={mdiCloseThick} size={1} />
        </div>
        <h2>Add Interruption</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px, 1fr))",
            gap: "15px",
          }}
        >
          <TextField
            onChange={handleChange}
            required
            label="Start Time"
            id="starttime"
            margin="normal"
            type="time"
            name="starttime"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: shifttime.startat,
              max: shifttime.endat,
            }}
          />
          <TextField
            onChange={handleChange}
            required
            label="End Time"
            id="endtime"
            margin="normal"
            type="time"
            name="endtime"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: shifttime.startat,
              max: shifttime.endat,
            }}
          />
        </div>

        <TextField
          onChange={handleChange}
          fullWidth
          label="Description"
          id="description"
          name="description"
          margin="normal"
          multiline
          minRows={2}
          maxRows={4}
          required
        />
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Select Workers</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  id="selectall"
                  onChange={handleSelectAll}
                  ref={selectall}
                />
              }
              label={`Everybody`}
            />
          </FormGroup>
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

export default AddInterruptionForm;
