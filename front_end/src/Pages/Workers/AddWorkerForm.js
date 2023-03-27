import "../../styles/AddWorkerForm.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import { useState, useEffect } from "react";
import DefaultPhoto from "../../img/workerdefault.png";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

const AddWorkerForm = (props) => {
  const [datas, setdatas] = useState({
    dateofbirth: null,
  });
  const [photoSrc, setphotoSrc] = useState(DefaultPhoto);
  let { handleClose } = props;
  let { setworkers } = props;
  const [isLoading, setisLoading] = useState(false);

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
    if (!target.files[0].type.includes("image")) return;
    setphotoSrc(URL.createObjectURL(target.files[0]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const photo = document.querySelector("#photo");
    if (photo.files.length === 0) {
      toast.error("Please Add A Photo");
      return;
    }
    console.log("clicked");
    setisLoading(true);
    //create mutltipart form data
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
        setworkers((workers) => [...workers, worker]);
        setdatas({
          dateofbirth: null,
        });
        setphotoSrc(DefaultPhoto);
        setisLoading(false);
        toast.success("Worker Added Successfully");
        e.target.reset();
      })
      .catch((e) => {
        setisLoading(false);
        toast.error(e.message);
      });
  };

  useEffect(() => {
    console.log(datas);
  }, [datas]);

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
        <input
          type="file"
          name="photo"
          id="photo"
          onChange={handlePhoto}
          accept="image/*"
        />
      </div>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <DatePicker
          label="Date Of Birth"
          placeholder="mm/dd/yyyy"
          value={datas.dateofbirth}
          onChange={(newValue) => {
            setdatas({ ...datas, dateofbirth: newValue.toJSDate() });
          }}
          renderInput={(params) => (
            <TextField
              margin="normal"
              fullWidth
              {...params}
              helperText={"mm/dd/yyyy"}
              required
            />
          )}
        />
      </LocalizationProvider>
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
      <input
        type="submit"
        value={isLoading ? "saving..." : "save"}
        disabled={isLoading ? "disabled" : null}
      />
      <br />
    </Box>
  );
};

export default AddWorkerForm;
