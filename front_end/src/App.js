import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Shifts from "./Pages/Shifts/Shifts";
import Workers from "./Pages/Workers/Workers";
import Stats from "./Pages/Stats/Stats";
import SignIn from "./Pages/SignIn/SignIn";
import DashboardLayout from "./components/DashboardLayout";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Loader from "./components/Loader";
import AuthProvider from "./auth/AuthProvider";
import useAuthContext from "./auth/useAuthContext";

// Add this in your component file
require("react-dom");
window.React2 = require("react");
console.log(window.React1 === window.React2);

let ProtectedRoute = ({ children }) => {
  const auth = useAuthContext();
  console.log(auth);
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
  return (
    <AuthProvider>
      <div className="App">
        {isLoading && <Loader />}
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
            </Route>
            <Route
              path="/signin"
              element={
                <ProtectedSignIn>
                  <SignIn setisLoading={setisLoading} />
                </ProtectedSignIn>
              }
            />
            <Route path="*" element={<>test</>} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
