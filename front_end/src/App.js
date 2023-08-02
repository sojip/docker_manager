import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Shifts from "./Pages/Shifts/Shifts";
import Workers from "./Pages/Workers/Workers";
import Stats from "./Pages/Stats/Stats";
import SignIn from "./Pages/SignIn/SignIn";
import DashboardLayout from "./components/DashboardLayout";
import Loader from "./components/Loader";
import AuthProvider from "./auth/AuthProvider";
import useAuthContext from "./auth/useAuthContext";
import { Events } from "./Pages/AccessEvents/Events";
import "./App.css";
// import { io } from "socket.io-client";

let ProtectedRoute = ({ children }) => {
  const auth = useAuthContext();
  if (auth === undefined) {
    return <Loader />;
  }
  let user = auth?.user;

  if (!user) {
    return <Navigate to="/signin" replace={true} />;
  }

  return children;
};

let ProtectedSignIn = ({ children }) => {
  const auth = useAuthContext();
  if (auth === undefined) {
    return <Loader />;
  }
  let user = auth?.user;
  if (user) {
    return <Navigate to="/" replace={true} />;
  }
  return children;
};

function App() {
  const [isLoading, setisLoading] = useState(false);

  // useEffect(() => {
  //   const socket = io("/");
  //   socket.on("connect", () => {
  //     console.log("socket connected");
  //   });
  //   socket.emit("message", { message: "test" });
  //   socket.on("event", function (data) {
  //     console.log(data);
  //   });

  //   return () => {
  //     socket.off("connect");
  //     socket.off("message");
  //   };
  // }, []);

  return (
    <div className="App">
      {isLoading && <Loader />}
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route
                path="/workers"
                element={<Workers setisLoading={setisLoading} />}
              />
              <Route
                path="/shifts"
                element={<Shifts setisLoading={setisLoading} />}
              />
              <Route path="/stats" element={<Stats />} />
              <Route path="/access-events" element={<Events />} />
            </Route>
            <Route
              path="/signin"
              element={
                <ProtectedSignIn>
                  <SignIn setisLoading={setisLoading} />
                </ProtectedSignIn>
              }
            />
            <Route path="*" element={<>ERROR</>} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
