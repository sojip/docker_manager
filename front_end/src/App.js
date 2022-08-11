import "./App.css";
import AppHeader from "./components/AppHeader";
import AppNav from "./components/AppNav";
import { Outlet } from "react-router-dom";
import Logo from "./img/logo.jpg";

function App() {
  return (
    <div className="App">
      <AppHeader />
      <AppNav />
      <div
        className="outlet-container"
        style={
          {
            // backgroundImage: `url(${Logo})`,
            // backgroundSize: "contain",
            // backgroundRepeat: "no-repeat",
            // backgroundPosition: "center",
            // backgroundBlendMode: "multiply",
            // backgroundAttachment: "fixed",
          }
        }
      >
        <Outlet />
      </div>
    </div>
  );
}

export default App;
