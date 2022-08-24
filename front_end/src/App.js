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
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
