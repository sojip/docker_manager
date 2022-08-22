import "../styles/AddWorkerForm.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import { useState } from "react";
import Alert from "@mui/material/Alert";

const AddWorkerForm = (props) => {
  const [datas, setdatas] = useState({});
  const [showsuccess, setshowsuccess] = useState(false);
  let { handleClose } = props;
  let { setworkers } = props;
  let { workers } = props;
  let { setsearchWorkersResults } = props;

  let style = {
    marginBottom: "15px",
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/api/workers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datas),
    })
      .then((res) => res.json())
      .then((worker) => {
        setshowsuccess(true);
        setsearchWorkersResults([...workers, worker]);
        setworkers([...workers, worker]);
        e.target.reset();
      })
      .catch((e) => console.log(e));
  };

  return (
    <>
      {showsuccess && (
        <Alert
          style={{ width: "96%", maxWidth: "500px", margin: "auto" }}
          onClose={() => {
            setshowsuccess(false);
          }}
        >
          New Worker Created Successfully
        </Alert>
      )}
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
        onSubmit={handleSubmit}
      >
        <div
          className="closeModalWrapper"
          id="closeModal"
          onClick={handleClose}
        >
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
          onChange={handleChange}
        />
        <TextField
          id="firstname"
          label="First Name"
          name="firstname"
          variant="outlined"
          style={style}
          onChange={handleChange}
          required
        />
        <TextField
          id="lastname"
          label="Last Name"
          name="lastname"
          variant="outlined"
          style={style}
          onChange={handleChange}
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
    </>
  );
};

export default AddWorkerForm;
