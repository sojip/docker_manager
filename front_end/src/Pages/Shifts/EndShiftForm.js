import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import MenuItem from "@mui/material/MenuItem";
import { TextField } from "@mui/material";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { useState, useContext, useEffect } from "react";
import { ShiftsContext } from "./Shifts";
import { SelectedShiftContext } from "./Shifts";
import { toast } from "react-toastify";

const EndShiftForm = (props) => {
  const { GLOBAL_STATE, dispatch } = props;
  const { shifts, setshifts } = useContext(ShiftsContext);
  const { selected_shift, setselectedshift } = useContext(SelectedShiftContext);
  const [formdatas, setformdatas] = useState({});
  const [shiftinstances, setshiftinstances] = useState(
    GLOBAL_STATE.shiftinstances.map((instance) => {
      return { ...instance, checked: false };
    })
  );
  const [issubmitting, setissubmitting] = useState(false);

  useEffect(() => {
    console.log(formdatas);
  }, [formdatas]);

  async function endShift(instance) {
    const res = await fetch(`/api/shiftinstances/${instance._id}/shift`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdatas[instance._id]),
    });
    const data = await res.json();
    return data;
  }

  const handleOpsDetailsChange = (e, dataset) => {
    let name = e.target.name;
    let value = e.target.value;
    if (dataset !== undefined) {
      return setformdatas({
        ...formdatas,
        [dataset.instance]: {
          ...formdatas[dataset.instance],
          [name]: value,
        },
      });
    }
    return setformdatas({
      ...formdatas,
      [e.currentTarget.dataset.instance]: {
        ...formdatas[e.currentTarget.dataset.instance],
        [name]: value,
      },
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setissubmitting(true);
    let selectedInstances = shiftinstances.filter(
      (instance) => instance.checked === true
    );
    if (selectedInstances.length === 0) return;
    Promise.all(
      selectedInstances.map((instance) => {
        return endShift(instance);
      })
    )
      .then((newInstances) => {
        dispatch({ type: "END_SHIFT_INSTANCES", payload: newInstances });
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
      }) //Change the status of the shift
      .then(async () => {
        const res = await fetch(`/api/shifts/${selected_shift._id}`, {
          method: "PUT",
        });
        const shift = await res.json();
        setselectedshift(shift);
        setshifts(
          shifts.map((_shift) => {
            if (_shift._id === shift._id) return { ...shift };
            return { ..._shift };
          })
        );
        toast.success("Shift Closed Successfully");
        setformdatas({});
        setissubmitting(false);
        e.target.reset();
      })
      .catch((e) => {
        setissubmitting(false);
        toast.error("An Error Occured");
        console.log(e);
      });
  };

  return (
    <div className="endShiftFormWrapper">
      <Box
        component="form"
        id="endShiftForm"
        onSubmit={handleSubmit}
        autoComplete="off"
        className="shiftDetailsForm"
      >
        <div
          className="closeForm"
          onClick={() => {
            dispatch({
              type: "TOGGLE_ENDSHIFT_FORM",
              payload: false,
            });
          }}
        >
          <Icon path={mdiCloseThick} size={1} />
        </div>
        <h2>Close Shift</h2>
        <FormControl
          component="fieldset"
          variant="standard"
          style={{ width: "100%" }}
        >
          <FormLabel component="legend">Select Workers</FormLabel>
          {shiftinstances.length > 0 &&
            shiftinstances.map((instance) => {
              return (
                <div key={instance.docker._id}>
                  <FormGroup key={instance.docker._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={instance.docker._id}
                          onChange={handleCheckboxChange}
                          checked={instance.checked}
                          data-detailsof={instance._id}
                        />
                      }
                      label={`${instance.docker.firstname} ${instance.docker.lastname}`}
                    />
                  </FormGroup>
                  {instance.checked && (
                    <div
                      className="operationDetails"
                      data-instance={instance._id}
                    >
                      <FormControl fullWidth>
                        <InputLabel id="opsTypeLabel">
                          Operation Type
                        </InputLabel>
                        <Select
                          labelId="opsTypeLabel"
                          id="opsTypeSelect"
                          value={
                            formdatas[instance._id]?.opsType !== undefined
                              ? formdatas[instance._id].opsType
                              : ""
                          }
                          label="Operation Type"
                          name="opsType"
                          inputProps={{
                            "data-instance": instance._id,
                          }}
                          onChange={(e) => {
                            handleOpsDetailsChange(e, {
                              instance: instance._id,
                            });
                          }}
                        >
                          <MenuItem value={"navire"}>Opération Navire</MenuItem>
                          <MenuItem value={"yard"}>Opération Yard</MenuItem>
                          <MenuItem value={"magasin"}>
                            Opération Magasin
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {formdatas[instance._id]?.opsType === "navire" ? (
                        <TextField
                          id="vesselname"
                          label="Vessel"
                          variant="outlined"
                          name="opsvessel"
                          onChange={handleOpsDetailsChange}
                          inputProps={{
                            "data-instance": instance._id,
                          }}
                          required
                        />
                      ) : null}
                      <TextField
                        id="opsposition"
                        label="Position"
                        variant="outlined"
                        required
                        name="opsposition"
                        onChange={handleOpsDetailsChange}
                        inputProps={{
                          "data-instance": instance._id,
                        }}
                      />
                      <TextField
                        id="opsdescription"
                        label="Description"
                        variant="outlined"
                        name="opsdescription"
                        onChange={handleOpsDetailsChange}
                        multiline
                        minRows={2}
                        required
                        inputProps={{
                          "data-instance": instance._id,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </FormControl>
        <br />
        <input
          type="submit"
          value={issubmitting ? "saving..." : "submit"}
          disabled={issubmitting ? "disabled" : null}
        />
      </Box>
    </div>
  );
};

export default EndShiftForm;
