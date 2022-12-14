import "../../styles/SignIn.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Icon from "@mdi/react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn(props) {
  const { setisLoggedIn } = props;
  const { setisLoading } = props;
  const [datas, setdatas] = useState({});
  let navigate = useNavigate();

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setdatas({ ...datas, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setisLoading(true);
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datas),
    })
      .then((res) => res.json())
      .then((datas) => {
        if (datas.message) {
          alertify.set("notifier", "position", "top-center");
          alertify.notify(datas.message, "custom");
        }
        if (datas.token) {
          alertify.set("notifier", "position", "top-center");
          alertify.success("Logged In Successfully");
          localStorage.setItem("utoken", datas.token);
          setisLoggedIn(true);
          navigate("/", { replace: true });
        }
        setisLoading(false);
      })
      .catch((e) => {
        setisLoading(false);
        alertify.set("notifier", "position", "top-center");
        alertify.error("An Error Occured");
        console.log(e);
      });
  };

  useEffect(() => {
    console.log(datas);
  }, [datas]);

  return (
    <div className="full-screen-container">
      <Box
        component="form"
        id="signinform"
        sx={{
          width: "96%",
          maxWidth: "500px",
          "& > :not(style)": { width: "100%" },
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
          p: 4,
        }}
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <h1>Docker Manager</h1>
        <TextField
          id="username"
          label="Username"
          name="username"
          variant="outlined"
          required
          margin="normal"
          onChange={handleChange}
        />
        <TextField
          id="password"
          label="Password"
          variant="outlined"
          name="password"
          type="password"
          required
          margin="normal"
          onChange={handleChange}
        />
        <input type="submit" value="Log In" />
      </Box>
    </div>
  );
}
