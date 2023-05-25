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
import { Spinner } from "../../components/Spinner";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Settings } from "luxon";

Settings.defaultZone = "UTC+1";

const AddShiftForm = (props) => {
  const auth = useAuthContext();
  const [datas, setdatas] = useState({ type: "", startdate: null });
  const [time, settime] = useState("");
  const [workers, setworkers] = useState([]);
  const { setshifts } = useContext(ShiftsContext);
  const [isLoading, setisLoading] = useState(true);
  const [submitting, setsubmitting] = useState(false);
  let { handleClose } = props;

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

  async function handleSubmit(e) {
    e.preventDefault();
    //cancel if nobody selected
    let selectedworkers = workers.filter((worker) => worker.checked === true);
    if (selectedworkers.length === 0) {
      throw new Error("Select Workers Please");
    }
    //send datas
    setsubmitting(true);
    fetch("/api/shifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datas),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          throw Error(data.message);
        }
        setshifts((shifts) => [data, ...shifts]);
        return Promise.all(
          selectedworkers.map((worker) => {
            return createShiftInstance(data, worker);
          })
        );
      })
      .then(() => {
        setdatas({ type: "", startdate: null });
        settime("");
        toast.success("New Shift Added Successfully");
        setworkers(
          workers.map((worker) => {
            return { ...worker, checked: false };
          })
        );
      })
      .catch((e) => {
        setsubmitting(false);
        toast.error(e.message);
        console.log(e);
      })
      .finally(() => {
        setsubmitting(false);
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
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div
            className="closeModalWrapper"
            id="closeModal"
            onClick={handleClose}
          >
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
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DatePicker
              label="Select The Start Date"
              placeholder="mm/dd/yyyy"
              value={datas.startdate}
              onChange={(newValue) => {
                setdatas({
                  ...datas,
                  startdate: newValue ? newValue.toISO() : null,
                });
              }}
              renderInput={(params) => (
                <TextField
                  margin="normal"
                  fullWidth
                  {...params}
                  helperText={"mm/dd/yyyy"}
                />
              )}
            />
          </LocalizationProvider>
          {/* <TextField
            id="startdate"
            name="startdate"
            variant="outlined"
            style={style}
            type="date"
            margin="normal"
            helperText="Select The Start Date"
            required
            onChange={handleChange}
          /> */}
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

          <input
            type="submit"
            value={submitting ? "saving..." : "save"}
            disabled={submitting ? "disabled" : null}
          />
          <br />
        </>
      )}
    </Box>
  );
};

export default AddShiftForm;
