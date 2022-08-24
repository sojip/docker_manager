import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Shifts from "./components/Shifts";
import Workers from "./components/Workers";
import Stats from "./components/Stats";
import AddWorkerForm from "./components/AddWorkerForm";
import SignIn from "./components/SignIn";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/addworker" element={<AddWorkerForm />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
