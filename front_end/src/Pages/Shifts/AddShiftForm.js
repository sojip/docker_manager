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
import "../../styles/AddShiftForm.css";
import useAuthContext from "../../auth/useAuthContext";
import { toast } from "react-toastify";
import { useContext } from "react";
import { ShiftsContext } from "./Shifts";

const AddShiftForm = (props) => {
  const auth = useAuthContext();
  const [datas, setdatas] = useState({ type: "", startdate: "" });
  const [time, settime] = useState("");
  const [workers, setworkers] = useState([]);
  const { setshifts } = useContext(ShiftsContext);
  let { handleClose } = props;
  let { setisLoading } = props;

  let style = {
    marginBottom: "15px",
  };

  async function getWorkers(signal) {
    const res = await fetch("/api/workers", {
      signal: signal,
      headers: {
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    });
    const workers = await res.json();
    return workers;
  }

  useEffect(() => {
    setisLoading(true);
    let controller = new AbortController();
    let signal = controller.signal;

    getWorkers(signal)
      .then((workers) => {
        setworkers(
          workers.map((worker) => {
            return { ...worker, checked: false };
          })
        );
        setisLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setisLoading(false);
          toast.error("An Error Occured");
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

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

  async function createShiftInstance(shift, docker) {
    const res = await fetch("/api/shiftinstances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shiftId: shift._id,
        dockerId: docker._id,
      }),
    });
    const instance = await res.json();
    return instance;
  }

  function handleSubmit(e) {
    setisLoading(true);
    e.preventDefault();
    let selectedworkers = workers.filter((worker) => worker.checked === true);
    if (selectedworkers.length === 0) {
      toast.error("Select Workers Please");
      setisLoading(false);
      return;
    }
    fetch("/api/shifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datas),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setisLoading(false);
          throw Error(data.error.message);
        }
        setshifts((shifts) => [data, ...shifts]);
        return Promise.all(
          selectedworkers.map((worker) => {
            return createShiftInstance(data, worker);
          })
        );
      })
      .then((result) => {
        e.target.reset();
        setdatas({ type: "", startdate: "" });
        settime("");
        setisLoading(false);
        toast.success("New Shift Added Successfully");
        setworkers(
          workers.map((worker) => {
            return { ...worker, checked: false };
          })
        );
      })
      .catch((e) => {
        setisLoading(false);
        toast.error(e.message);
        console.log(e);
      });
  }

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
      onSubmit={handleSubmit}
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
                    <Checkbox
                      id={worker._id}
                      onChange={handleCheckboxChange}
                      checked={worker.checked}
                    />
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
