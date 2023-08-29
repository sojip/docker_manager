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
import { useAuthContext } from "./auth/useAuthContext";
import { Events } from "./Pages/AccessEvents/Events";
import "./App.css";
import { createContext, useContext, useState } from "react";
// import { io } from "socket.io-client";

let ProtectedRoute = ({ children }) => {
  const { ischecking, user } = useAuthContext();
  if (ischecking) return <Loader />;
  if (!user) return <Navigate to="/signin" replace={true} />;
  return children;
};

let ProtectedSignIn = ({ children }) => {
  const { ischecking, user } = useAuthContext();
  if (ischecking) return <Loader />;
  if (user) return <Navigate to="/" replace={true} />;
  return children;
};

let LoadingContext = createContext();
export const useLoadingContext = () => {
  const setisLoading = useContext(LoadingContext);
  return setisLoading;
};

function App() {
  const [isLoading, setisLoading] = useState(false);
  return (
    <div className="App">
      {isLoading && <Loader />}
      <LoadingContext.Provider value={setisLoading}>
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
                <Route path="/workers" element={<Workers />} />
                <Route path="/shifts" element={<Shifts />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/access-events" element={<Events />} />
              </Route>
              <Route
                path="/signin"
                element={
                  <ProtectedSignIn>
                    <SignIn />
                  </ProtectedSignIn>
                }
              />
              <Route path="*" element={<>ERROR</>} />
            </Routes>
          </Router>
        </AuthProvider>
      </LoadingContext.Provider>
    </div>
  );
}

export default App;
