import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import { mdiMenu } from "@mdi/js";
import { mdiAccountTie } from "@mdi/js";
import "../styles/AppHeader.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppHeader = (props) => {
  const { setisLoggedIn } = props;
  const closeprofileOptions = (e) => {
    let isopened = document.querySelector(".profileOptions.isopened");
    let optionsButton = document.querySelector(".toggleOptions");
    if (e.target !== optionsButton && !optionsButton.contains(e.target)) {
      if (isopened !== null)
        document.querySelector(".profileOptions").classList.remove("isopened");
    }
  };
  useEffect(() => {
    window.addEventListener("click", closeprofileOptions);
    return () => {
      window.removeEventListener("click", closeprofileOptions);
    };
  }, []);

  function ToggleProfileOptions(e) {
    let profileOptions = document.querySelector(".profileOptions");
    profileOptions.classList.toggle("isopened");
    return;
  }

  function ToggleNav() {
    let nav = document.querySelector("nav");
    let descriptions = document.querySelectorAll(".navitemDesc");
    let main = document.querySelector(".main");
    nav.classList.toggle("isfull");
    main.classList.toggle("shrink");
    descriptions.forEach((description) => {
      description.classList.toggle("show");
    });
    return;
  }

  function handleLogOut(e) {
    localStorage.removeItem("utoken");
    setisLoggedIn(false);
  }
  return (
    <header>
      <Icon
        path={mdiMenu}
        size={1}
        onClick={ToggleNav}
        style={{ cursor: "pointer" }}
      />
      <h3>Welcome Sojip {/* add username */}</h3>
      <div className="wrapper">
        <div className="profileImageContainer">
          <Icon path={mdiAccountTie} size={1} />
        </div>
        <div
          onClick={ToggleProfileOptions}
          style={{ cursor: "pointer", display: "flex", alignitems: "center" }}
          className="toggleOptions"
        >
          <Icon path={mdiChevronDown} size={1.1} />
        </div>
      </div>
      <ul className="profileOptions">
        <li onClick={handleLogOut}>Log Out</li>
        <li>Profile</li>
      </ul>
    </header>
  );
};

export default AppHeader;
