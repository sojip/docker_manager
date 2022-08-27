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
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { TextField } from "@mui/material";

const EndShiftForm = (props) => {
  const { handleCloseEndShiftForm } = props;
  const { shiftinstances } = props;
  const { handleCheckboxChange } = props;
  const { setshiftinstances } = props;

  async function endShift(instance) {
    const res = await fetch(
      `http://localhost:3000/api/shiftinstances/${instance._id}/shift`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    return data;
  }

  const handleOpsDetailsChange = (e, dataset) => {
    let name = e.target.name;
    let value = e.target.value;
    if (dataset !== undefined) {
      return setshiftinstances(
        shiftinstances.map((instance) => {
          if (instance._id === dataset.instance)
            instance.operation = {
              ...instance.operation,
              [name]: value,
            };
          return instance;
        })
      );
    }
    setshiftinstances(
      shiftinstances.map((instance) => {
        if (instance._id === e.target.dataset.instance)
          instance.operation = { ...instance.operation, [name]: value };
        return instance;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let selectedInstances = shiftinstances.filter(
      (instance) => instance.checked === true
    );
    Promise.all(
      selectedInstances.map((instance) => {
        return endShift(instance);
      })
    )
      .then((result) => {
        console.log(result);
        // setshiftinstances((instance) => {
        //   if (result.includes(instance)) instance.endedshift = true;
        //   return {...instance, checked: false}
        // })
        alertify.set("notifier", "position", "top-center");
        alertify.success("Shift Closed Successfully");
        setshiftinstances(
          shiftinstances.map((instance) => {
            return { ...instance, checked: false };
          })
        );
        e.target.reset();
      })
      .catch((e) => {
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
        <h2>End Shift</h2>
        <FormControl
          component="fieldset"
          variant="standard"
          style={{ width: "100%" }}
        >
          <FormLabel component="legend">Select Workers</FormLabel>
          {shiftinstances.map((instance) => {
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
                      id="opsType"
                      select
                      label="Type"
                      required
                      onChange={(e) => {
                        handleOpsDetailsChange(e, { instance: instance._id });
                      }}
                      name="opsType"
                    >
                      <MenuItem value={"navire"}>Opération Navire</MenuItem>
                      <MenuItem value={"yard"}>Opération Yard</MenuItem>
                      <MenuItem value={"magasin"}>Opération magasin</MenuItem>
                    </TextField>

                    {instance.operation !== undefined &&
                    instance.operation.opsType === "navire" ? (
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
