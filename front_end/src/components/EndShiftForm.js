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
        novalidate
        autoComplete="off"
      >
        <div className="closeForm" onClick={handleCloseEndShiftForm}>
          <Icon path={mdiCloseThick} size={1} />
        </div>
        <h2>End Shift</h2>
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
        <br />
        <input type="submit" value="Save" />
      </Box>
    </div>
  );
};

export default EndShiftForm;
