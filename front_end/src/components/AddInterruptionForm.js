import { useState } from "react";
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

export default AddInterruptionForm;
