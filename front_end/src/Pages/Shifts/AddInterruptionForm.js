import { useState, useEffect } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import Box from "@mui/material/Box";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import {
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const AddInterruptionForm = (props) => {
  const { handleCloseAddInterruptionForm } = props;
  const { handleCheckboxChange } = props;
  const { shiftinstances } = props;
  const { setshiftinstances } = props;
  const { selected_id } = props;
  const { interruptions } = props;
  const { setinterruptions } = props;
  const [datas, setdatas] = useState({});

  useEffect(() => {
    console.log(datas);
  }, [datas]);

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

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/interruptions", {
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
        alertify.set("notifier", "position", "top-center");
        alertify.success("New Interruption Added Successfully");
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
      })
      .catch((e) => {
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
            InputProps={{
              // endAdornment: (
              //   <InputAdornment position="end">mins</InputAdornment>
              // ),
              min: "12:00",
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
            // InputProps={{
            //   endAdornment: <InputAdornment position="end">mins</InputAdornment>,
            // }}
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
              control={<Checkbox id={"selectall"} onChange={handleSelectAll} />}
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
