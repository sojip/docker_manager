import "../styles/AddWorkerForm.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import { useState } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import DefaultPhoto from "../img/photodefault.png";

const AddWorkerForm = (props) => {
  const [datas, setdatas] = useState({});
  const [photoSrc, setphotoSrc] = useState(DefaultPhoto);
  let { handleClose } = props;
  let { setworkers } = props;
  let { workers } = props;
  let { setsearchWorkersResults } = props;
  let { setisLoading } = props;

  let style = {
    marginBottom: "15px",
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
  };

  const handlePhoto = (e) => {
    let target = e.target;
    if (target.files.length === 0) return;
    setphotoSrc(URL.createObjectURL(target.files[0]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setisLoading(true);
    //send mutltipart form data
    const photo = document.querySelector("#photo");
    if (photo.files.length === 0) {
      // TO DO require photo
    }
    let formData = new FormData();
    formData.append("photo", photo.files[0]);
    const keys = Object.keys(datas);
    keys.forEach((key) => {
      formData.append(key, datas[key]);
    });
    fetch(`/api/workers`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((worker) => {
        setisLoading(false);
        alertify.set("notifier", "position", "top-center");
        alertify.success("New Worker Created Successfully");
        setsearchWorkersResults([...workers, worker]);
        setworkers([...workers, worker]);
        e.target.reset();
        setphotoSrc(DefaultPhoto);
      })
      .catch((e) => {
        alertify.set("notifier", "position", "top-center");
        alertify.error("An Error Occured");
        setisLoading(false);
        console.log(e);
      });
  };

  return (
    <Box
      component="form"
      id="addworkerform"
      sx={{
        width: "96%",
        maxWidth: "500px",
        padding: "2vh 1vw",
        margin: "auto",
        "& > :not(style)": { width: "100%" },
        // position: "absolute",
        // top: "50%",
        // left: "50%",
        // transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
      }}
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="closeModalWrapper" id="closeModal" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>

      <h3>Add Worker</h3>

      <div className="form-group">
        <label htmlFor="photo" id="photolabel">
          <img src={photoSrc} alt="" />
        </label>
        <input type="file" name="photo" id="photo" onChange={handlePhoto} />
      </div>
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
      <TextField
        id="position"
        label="Position"
        name="position"
        variant="outlined"
        style={style}
        onChange={handleChange}
        required
      />
      <br />
      <TextField
        id="cni"
        label="N CNI"
        name="cni"
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
  );
};

export default AddWorkerForm;
