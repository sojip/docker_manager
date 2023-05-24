import "../../styles/AddWorkerForm.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";
import { useState, useEffect } from "react";
import DefaultPhoto from "../../img/workerdefault.png";
import FingerPrint from "../../img/fingerprint.jpg";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { InputAdornment, IconButton } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";

const AddWorkerForm = (props) => {
  const [isLoading, setisLoading] = useState(false);
  const [iscapturing, setiscapturing] = useState(false);
  const [datas, setdatas] = useState({
    dateofbirth: null,
    fingerprintcapture: "",
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
    setiscapturing(true);
    setdatas({ ...datas, fingerprintcapture: "" });
    fetch("/api/capture_fingerprint")
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (data.ResponseStatus !== undefined)
          throw new Error(data.ResponseStatus.statusString[0]);
        //tcheck fingerprint quality
        const fingercapture = data.CaptureFingerPrint;
        const fingercaptureQuality = Number(
          fingercapture.fingerPrintQuality[0]
        );
        if (fingercaptureQuality < 80)
          throw new Error("Bad FingerPrint Quality, Please Try Again");
        setdatas({ ...datas, fingerprintcapture: fingercapture.fingerData[0] });
      })
      .finally(() => {
        setiscapturing(false);
      })
      .catch((e) => toast.error(e.message));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const photo = document.querySelector("#photo");
    if (photo.files.length === 0) {
      return toast.info("Please Add A Photo");
    }
    if (datas.fingerprintcapture === "") {
      return toast.info("Please Add A Fingerprint");
    }
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
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((worker) => {
        setworkers((workers) => [...workers, worker]);
        setdatas({
          dateofbirth: null,
          fingerprintcapture: "",
        });
        setphotoSrc(DefaultPhoto);
        toast.success("Worker Added Successfully");
        e.target.reset();
      })
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => {
        setisLoading(false);
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
      <TextField
        id="fingerpirnt"
        label="Fingerprint"
        name="fingerprint"
        variant="outlined"
        style={style}
        InputProps={{
          readOnly: true,
          startAdornment:
            datas.fingerprintcapture === "" ? null : (
              <img src={FingerPrint} id="fingerprintImg" alt="" />
            ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCaptureFingerprint}
                // onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {iscapturing ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                ) : (
                  <TouchAppIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
