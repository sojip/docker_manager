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
import BadgeIcon from "@mui/icons-material/Badge";

const AddWorkerForm = (props) => {
  const [isSubmitting, setisSubmitting] = useState(false);
  const [iscapturingfingerIn, setiscapturingfingerIn] = useState(false);
  const [iscapturingfingerOut, setiscapturingfingerOut] = useState(false);
  const [iscapturingcard, setiscapturingcard] = useState(false);
  const [datas, setdatas] = useState({
    photo: null,
    dateofbirth: null,
    fingerprintcapturecheckIn: "",
    fingerprintcapturecheckOut: "",
    cardInfo: "",
  });
  let { handleClose, setworkers } = props;

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
    setdatas({ ...datas, photo: target.files[0] });
  };

  const handleCaptureFingerprintCheckIn = () => {
    setiscapturingfingerIn(true);
    setdatas({ ...datas, fingerprintcapturecheckIn: "" });
    fetch("/api/capture_fingerprint_checkin")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ResponseStatus !== undefined)
          throw new Error(data.ResponseStatus.statusString[0]);
        //tcheck fingerprint quality
        const fingercapture = data.CaptureFingerPrint;
        const fingercaptureQuality = Number(
          fingercapture.fingerPrintQuality[0]
        );
        if (fingercaptureQuality < 80)
          throw new Error("Bad FingerPrint Quality, Please Try Again");
        setdatas({
          ...datas,
          fingerprintcapturecheckIn: fingercapture.fingerData[0],
        });
      })
      .finally(() => {
        setiscapturingfingerIn(false);
      })
      .catch((e) => toast.error(e.message));
  };

  const handleCaptureFingerprintCheckOut = () => {
    setiscapturingfingerOut(true);
    setdatas({ ...datas, fingerprintcapturecheckOut: "" });
    fetch("/api/capture_fingerprint_checkout")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ResponseStatus !== undefined)
          throw new Error(data.ResponseStatus.statusString[0]);
        //tcheck fingerprint quality
        const fingercapture = data.CaptureFingerPrint;
        const fingercaptureQuality = Number(
          fingercapture.fingerPrintQuality[0]
        );
        if (fingercaptureQuality < 80)
          throw new Error("Bad FingerPrint Quality, Please Try Again");
        setdatas({
          ...datas,
          fingerprintcapturecheckOut: fingercapture.fingerData[0],
        });
      })
      .finally(() => {
        setiscapturingfingerOut(false);
      })
      .catch((e) => toast.error(e.message));
  };

  const handleCaptureCard = () => {
    setiscapturingcard(true);
    setdatas({ ...datas, cardInfo: "" });
    fetch("/api/capture_cardinfo")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ResponseStatus !== undefined)
          throw new Error(data.ResponseStatus.statusString[0]);
        const cardInfo = data.CardInfo.cardNo;
        console.log(cardInfo);
        setdatas({ ...datas, cardInfo });
      })
      .finally(() => {
        setiscapturingcard(false);
      })
      .catch((e) => toast.error(e.message));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, error } = checkValidity(datas);
    if (!isValid) return toast.error(error);
    setisSubmitting(true);
    //create mutltipart form data
    let formData = new FormData();
    const properties = Object.keys(datas);
    properties.forEach((property) => {
      formData.append(property, datas[property]);
    });
    fetch(`/api/workers`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
      })
      .then((worker) => {
        setworkers((workers) => [...workers, worker]);
        setdatas({
          photo: null,
          dateofbirth: null,
          fingerprintcapturecheckIn: "",
          fingerprintcapturecheckOut: "",
          cardInfo: "",
        });
        toast.success("Worker Added Successfully");
        e.target.reset();
      })
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => {
        setisSubmitting(false);
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
          <img
            src={
              datas.photo === null
                ? DefaultPhoto
                : URL.createObjectURL(datas.photo)
            }
            alt=""
          />
        </label>
        <input
          type="file"
          name="photo"
          id="photo"
          onChange={handlePhoto}
          required
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
              dateofbirth: newValue ? newValue.toISO() : null,
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
      <TextField
        id="cni"
        label="N CNI"
        name="cni"
        variant="outlined"
        style={style}
        onChange={handleChange}
        required
      />
      <TextField
        id="accesscard"
        label="Access Card"
        name="card"
        variant="outlined"
        style={style}
        value={datas.cardInfo}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCaptureCard}
                edge="end"
              >
                {iscapturingcard ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                ) : (
                  <BadgeIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        id="fingerprint checkin"
        label="Fingerprint CheckIn"
        name="fingerprint_checkin"
        variant="outlined"
        style={style}
        InputProps={{
          readOnly: true,
          startAdornment:
            datas.fingerprintcapturecheckIn === "" ? null : (
              <img src={FingerPrint} id="fingerprintImg" alt="" />
            ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCaptureFingerprintCheckIn}
                edge="end"
              >
                {iscapturingfingerIn ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                ) : (
                  <TouchAppIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        id="fingerprint checkout"
        label="Fingerprint CheckOut"
        name="fingerprint_checkout"
        variant="outlined"
        style={style}
        InputProps={{
          readOnly: true,
          startAdornment:
            datas.fingerprintcapturecheckOut === "" ? null : (
              <img src={FingerPrint} id="fingerprintImg" alt="" />
            ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCaptureFingerprintCheckOut}
                edge="end"
              >
                {iscapturingfingerOut ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                ) : (
                  <TouchAppIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <input
        type="submit"
        value={isSubmitting ? "saving..." : "save"}
        disabled={isSubmitting ? "disabled" : null}
      />
    </Box>
  );
};

/** Helpers */

function checkValidity(formdata) {
  if (formdata.cardInfo === "")
    return { isValid: false, error: "Access Card Is Required" };
  if (
    formdata.fingerprintcapturecheckIn === "" ||
    formdata.fingerprintcapturecheckOut === ""
  )
    return { isValid: false, error: "FingerPrint Is Required" };
  return { isValid: true };
}

export default AddWorkerForm;
