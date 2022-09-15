import { useState, useEffect } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import Box from "@mui/material/Box";
import Icon from "@mdi/react";
import { mdiCloseThick, mdiFormatLineStyle } from "@mdi/js";
import {
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DateTime, Interval } from "luxon";

const AddInterruptionForm = (props) => {
  const { handleCloseAddInterruptionForm } = props;
  const { handleCheckboxChange } = props;
  const { shiftinstances } = props;
  const { setshiftinstances } = props;
  const { selected_id } = props;
  const { interruptions } = props;
  const { setinterruptions } = props;
  const { setisLoading } = props;
  const [datas, setdatas] = useState({});
  const [shift, setshift] = useState({});
  const [selectall, setselectall] = useState(false);
  const [shifttime, setshifttime] = useState({
    startat: "",
    endat: "",
  });

  useEffect(() => {
    getShiftTimes();
  }, []);

  useEffect(() => {
    console.log(shifttime);
  }, [shifttime]);

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
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

  async function getShiftTimes() {
    const res = await fetch(`/api/shifts/${selected_id}`);
    const shift = await res.json();
    setshift(shift);
    switch (shift.type) {
      case "jour":
        setshifttime({ startat: "07:00", endat: "19:00" });
        break;
      case "nuit":
        setshifttime({ startat: "19:00", endat: "07:00" });
        break;
    }
    return;
  }

  const handleSelectAll = (e) => {
    const checked = !selectall;
    setselectall(!selectall);
    if (checked) {
      return setshiftinstances(
        shiftinstances.map((instance) => {
          instance.checked = true;
          return instance;
        })
      );
    }
    setshiftinstances(
      shiftinstances.map((instance) => {
        instance.checked = false;
        return instance;
      })
    );
  };

  async function getInterruptionInstances(interruption) {
    const res = await fetch(
      `/api/interruptions/${interruption._id}/shiftinstances`
    );
    const instances = await res.json();
    return { ...interruption, instances };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setisLoading(true);
    let interruptionStartDate;
    let interruptionEndDate;
    if (shift.type === "jour") {
      interruptionStartDate = new Date(shift.startdate.split("T")[0]);
      interruptionEndDate = new Date(shift.startdate.split("T")[0]);
    }
    if (shift.type === "nuit") {
      let beforeMidnightHours = [19, 20, 21, 22, 23];
      beforeMidnightHours.includes(Number(datas.starttime.split(":")[0]))
        ? (interruptionStartDate = new Date(shift.startdate.split("T")[0]))
        : (interruptionStartDate = new Date(shift.enddate.split("T")[0]));
      beforeMidnightHours.includes(Number(datas.endtime.split(":")[0]))
        ? (interruptionEndDate = new Date(shift.startdate.split("T")[0]))
        : (interruptionEndDate = new Date(shift.enddate.split("T")[0]));
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
        shift: selected_id,
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
        let interruption = JSON.parse(
          JSON.stringify(result[result.length - 1])
        );
        interruption.instances = result.slice(0, -1);
        console.log(interruption);
        setinterruptions([...interruptions, interruption]);
        e.target.reset();
        alertify.set("notifier", "position", "top-center");
        alertify.success("New Interruption Added Successfully");
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
        setselectall(false);
        setisLoading(false);
      })
      .catch((e) => {
        setisLoading(false);
        alertify.set("notifier", "position", "top-center");
        alertify.error("An Error Occured");
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
      >
        <div className="closeForm" onClick={handleCloseAddInterruptionForm}>
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
                  id={"selectall"}
                  checked={selectall}
                  onChange={handleSelectAll}
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
