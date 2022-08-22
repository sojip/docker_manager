import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useState, useEffect } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FormLabel } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import "../styles/AddShiftForm.css";

const AddShiftForm = (props) => {
  let { handleClose } = props;
  let style = {
    marginBottom: "15px",
  };

  const [datas, setdatas] = useState({ type: "", startdate: "" });
  const [time, settime] = useState("");
  const [workers, setworkers] = useState([]);

  const handleChange = (event) => {
    let value = event.target.value;
    let name = event.target.name;
    if (name === "type") value === "jour" ? settime("07:00") : settime("19:00");
    setdatas({ ...datas, [name]: value });
  };
  function handleCheckboxChange(e) {
    setworkers(
      workers.map((worker) => {
        if (worker._id === e.target.id) worker.checked = !worker.checked;
        return worker;
      })
    );
  }

  async function getWorkers() {
    const res = await fetch("http://localhost:3000/api/workers");
    const workers = await res.json();
    return workers;
  }

  useEffect(() => {
    getWorkers().then((workers) => {
      setworkers(
        workers.map((worker) => {
          return { ...worker, checked: false };
        })
      );
    });
  }, []);

  useEffect(() => {
    console.log(workers);
  }, [workers]);

  return (
    <Box
      component="form"
      id="addshiftform"
      sx={{
        width: "96%",
        maxWidth: "500px",
        padding: "2vh 1vw",
        "& > :not(style)": { width: "100%" },
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        margin: "auto",
      }}
      //   noValidate
      autoComplete="off"
    >
      <div className="closeModalWrapper" id="closeModal" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>

      <h3>Start A Shift</h3>
      <div className="typeandtimeWrapper">
        <FormControl>
          <InputLabel id="typeLabel">Type</InputLabel>
          <Select
            labelId="typeLabel"
            id="type"
            value={datas.type}
            label="type"
            name="type"
            onChange={handleChange}
            required
          >
            <MenuItem value={"jour"}>jour</MenuItem>
            <MenuItem value={"nuit"}>nuit</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="time"
          label="time"
          name="time"
          variant="outlined"
          style={style}
          value={time}
          required
          type="time"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
      <TextField
        id="startdate"
        name="startdate"
        variant="outlined"
        style={style}
        type="date"
        margin="normal"
        helperText="Select The Start Date"
        required
        onChange={handleChange}
      />
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend">Select Workers</FormLabel>
        {workers.length > 0 &&
          workers.map((worker) => {
            return (
              <FormGroup key={worker._id}>
                <FormControlLabel
                  control={
                    <Checkbox id={worker._id} onChange={handleCheckboxChange} />
                  }
                  label={`${worker.firstname} ${worker.lastname}`}
                />
              </FormGroup>
            );
          })}
      </FormControl>

      <input type="submit" value="save" />
      <br />
    </Box>
  );
};

export default AddShiftForm;
