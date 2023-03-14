import "../../styles/SignIn.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuthContext from "../../auth/useAuthContext";

export default function SignIn(props) {
  const [datas, setdatas] = useState({});
  const auth = useAuthContext();
  const { setisLoading } = props;

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
        if (!datas.user) {
          toast.error(datas.message);
          setisLoading(false);
          return;
        }
        toast.success("Logged In Successfully");
        auth.setuser({
          id: datas.user._id,
          username: datas.user.username,
          profile: datas.user.profile,
          access_token: datas.access_token,
        });
        setisLoading(false);
      })
      .catch((e) => {
        setisLoading(false);
        toast.error(e);
      });
  };

  return (
    <div className="full-screen-container">
      <ToastContainer />
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
