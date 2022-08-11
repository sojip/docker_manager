import "../styles/AddWorkerForm.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";

const AddWorkerForm = (props) => {
  let { handleClose } = props;
  let style = {
    marginBottom: "15px",
  };
  return (
    <Box
      component="form"
      id="addworkerform"
      sx={{
        width: "96%",
        maxWidth: "500px",
        padding: "2vh 1vw",
        "& > :not(style)": { width: "100%" },
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
      }}
      //   noValidate
      autoComplete="off"
    >
      <div className="closeModalWrapper" id="closeModal" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>

      <h3>Add Worker</h3>
      <TextField
        id="dateofbirth"
        name="dateofbirth"
        variant="outlined"
        type="date"
        helperText="Date Of Birth"
        style={style}
        required
      />
      <TextField
        id="firstname"
        label="First Name"
        name="firstname"
        variant="outlined"
        style={style}
        required
      />
      <TextField
        id="lastname"
        label="Last Name"
        name="lastname"
        variant="outlined"
        style={style}
        required
      />
      <br />
      <TextField
        id="outlined-multiline-static"
        label="Finger Print"
        multiline
        rows={4}
        style={style}
      />

      <br />

      <input type="submit" value="save" />
      <br />
    </Box>
  );
};

export default AddWorkerForm;
