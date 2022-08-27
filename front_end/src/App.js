import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Shifts from "./components/Shifts";
import Workers from "./components/Workers";
import Stats from "./components/Stats";
import SignIn from "./components/SignIn";
import DashboardLayout from "./components/DashboardLayout";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loader from "./components/Loader";

let ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

let ProtectedSignIn = ({ isLoggedIn, children }) => {
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setisLoggedIn] = useState(
    localStorage.getItem("utoken") !== null
  );

  const [isLoading, setisLoading] = useState(false);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
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
          </Route>
          <Route
            path="/signin"
            element={
              <ProtectedSignIn isLoggedIn={isLoggedIn}>
                <SignIn isLoggedIn={isLoggedIn} setisLoggedIn={setisLoggedIn} />
              </ProtectedSignIn>
            }
          />
          <Route path="*" element={<>test</>} />
        </Routes>
      </div>
      <Loader isActive={isLoading} />
    </Router>
  );
}

export default App;
