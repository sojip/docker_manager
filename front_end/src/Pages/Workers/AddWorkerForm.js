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
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
// import AxiosDigestAuth from "@mhoc/axios-digest-auth";
// import { DigestClient } from "digest-fetch";
import * as DigestClient from "digest-fetch";

const AddWorkerForm = (props) => {
  const [isLoading, setisLoading] = useState(false);
  const [datas, setdatas] = useState({
    dateofbirth: null,
  });
  const [photoSrc, setphotoSrc] = useState(DefaultPhoto);
  let { handleClose } = props;
  let { setworkers } = props;

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

  const handleCaptureFingerprint = () => {
    console.log("clicked");
    // fetch("/ISAPI/AccessControl/CaptureFingerPrint")
    //   .then((resp) => console.log(resp))
    //   .catch((e) => {
    //     console.log(e);
    //   });
    const url = "/ISAPI/AccessControl/capabilities";
    const username = "admin";
    const password = "08Aug#@!2020";
    const url_ = "/digest-auth/auth/test/pass";
    const username_ = "test";
    const password_ = "pass";

    const client = new DigestClient(username_, password_, { statusCode: 400 });
    // const fingerPrintCond = `<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
    //     <fingerNo>1</fingerNo>
    // </CaptureFingerPrintCond>`;
    client
      .fetch(url_, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        // body: JSON.stringify({
        //   UserInfoSearchCond: {
        //     searchID: "1",
        //     searchResultPosition: 0,
        //     maxResults: 2000,
        //   },
        // }),
      })
      .then((resp) => {
        try {
          console.log(resp);
          return resp.json();
        } catch (e) {
          console.log(resp);
          alert(e);
          return;
        }
      })
      .then((data) => console.log(data));
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
            setdatas({
              ...datas,
              dateofbirth: newValue ? newValue.toJSDate() : null,
            });
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
      {/* <TextField
        id="outlined-multiline-static"
        label="Finger Print"
        multiline
        rows={4}
        style={style}
      /> */}
      <FormControl variant="outlined">
        <InputLabel htmlFor="outlined-adornment-fingerprint">
          Fingerprint
        </InputLabel>
        <OutlinedInput
          id="outlined-adornment-fingerprint"
          type="text"
          style={style}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCaptureFingerprint}
                // onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                <TouchAppIcon />
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
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
