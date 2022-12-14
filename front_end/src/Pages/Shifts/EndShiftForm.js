import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import Box from "@mui/material/Box";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import MenuItem from "@mui/material/MenuItem";
import { TextField } from "@mui/material";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { useState } from "react";

const EndShiftForm = (props) => {
  const { handleCloseEndShiftForm } = props;
  const { shiftinstances } = props;
  const { handleCheckboxChange } = props;
  const { setshiftinstances } = props;
  const { selected_id } = props;
  const { setshifts } = props;
  const { shifts } = props;
  const { setshift } = props;
  const { setisLoading } = props;
  const [formdatas, setformdatas] = useState({});

  // useEffect(() => {
  //   console.log(formdatas);
  // }, [formdatas]);

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
        const res = await fetch(`/api/shifts/${selected_id}`, {
          method: "PUT",
        });
        const shift = await res.json();
        setshift(shift);
        setshifts(
          shifts.map((shift_) => {
            if (shift_._id === shift._id) return { ...shift };
            return { ...shift_ };
          })
        );
        alertify.set("notifier", "position", "top-center");
        alertify.success("Shift Closed Successfully");
        e.target.reset();
        setformdatas({});
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
    <div className="endShiftFormWrapper">
      <Box
        component="form"
        id="endShiftForm"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="closeForm" onClick={handleCloseEndShiftForm}>
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
                          <MenuItem value={"navire"}>Op??ration Navire</MenuItem>
                          <MenuItem value={"yard"}>Op??ration Yard</MenuItem>
                          <MenuItem value={"magasin"}>
                            Op??ration Magasin
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
