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
import { useState, useContext } from "react";
import { ShiftsContext } from "./Shifts";
import { SelectedShiftContext } from "./Shifts";
import { toast } from "react-toastify";

const EndShiftForm = (props) => {
  const { closeForms } = props;
  const { handleCheckboxChange } = props;
  const { shiftinstances } = props;
  const { setshiftinstances } = props;
  const { setisLoading } = props;
  const { shifts, setshifts } = useContext(ShiftsContext);
  const { selected_shift, setselectedshift } = useContext(SelectedShiftContext);
  const [formdatas, setformdatas] = useState({});

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
      let selectedinstance = shiftinstances.find((instance) => {
        return instance._id === dataset.instance;
      });
      return setformdatas({
        ...formdatas,
        [selectedinstance._id]: {
          ...formdatas[selectedinstance._id],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setisLoading(true);
    let selectedInstances = shiftinstances.filter(
      (instance) => instance.checked === true
    );
    Promise.all(
      selectedInstances.map((instance) => {
        return endShift(instance);
      })
    )
      .then((newInstances) => {
        setshiftinstances(
          shiftinstances.map((shiftinstance) => {
            let instance = newInstances.find(
              (instance) => instance._id === shiftinstance._id
            );
            if (instance) return { ...instance, checked: false };
            return { ...shiftinstance, checked: false };
          })
        );
      }) //Change the status of the shift
      .then(async () => {
        const res = await fetch(`/api/shifts/${selected_shift._id}`, {
          method: "PUT",
        });
        const _shift = await res.json();
        setselectedshift(_shift);
        setshifts(
          shifts.map((_shift) => {
            if (_shift._id === selected_shift._id) return { ...selected_shift };
            return { ..._shift };
          })
        );
        toast.success("Shift Closed Successfully");
        setformdatas({});
        setisLoading(false);
        e.target.reset();
      })
      .catch((e) => {
        setisLoading(false);
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
        <div className="closeForm" onClick={closeForms}>
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
                            formdatas[instance._id] !== undefined &&
                            formdatas[instance._id].opsType !== undefined
                              ? formdatas[instance._id].opsType
                              : ""
                          }
                          label="Operation Type"
                          name="opsType"
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

                      {formdatas[instance._id] !== undefined &&
                      formdatas[instance._id].opsType === "navire" ? (
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
        <input type="submit" value="Submit" />
      </Box>
    </div>
  );
};

export default EndShiftForm;
