import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import { mdiMenu } from "@mdi/js";
import { mdiAccountTie } from "@mdi/js";
import "../styles/AppHeader.css";
import { useEffect } from "react";

const AppHeader = () => {
  const closeprofileOptions = (e) => {
    let isopened = document.querySelector(".profileOptions.isopened");
    let optionsButton = document.querySelector(".toggleOptions");
    if (e.target !== optionsButton && isopened !== null) {
      document.querySelector(".profileOptions").classList.remove("isopened");
    }
  };
  useEffect(() => {
    window.addEventListener("click", closeprofileOptions);
    return () => {
      window.removeEventListener("click", closeprofileOptions);
    };
  });

  function ToggleProfileOptions() {
    let profileOptions = document.querySelector(".profileOptions");
    profileOptions.classList.toggle("isopened");
    return;
  }

  function ToggleNav() {
    let nav = document.querySelector("nav");
    let descriptions = document.querySelectorAll(".navitemDesc");
    let outletcontainer = document.querySelector(".outlet-container");
    nav.classList.toggle("isfull");
    outletcontainer.classList.toggle("shrink");
    descriptions.forEach((description) => {
      description.classList.toggle("show");
    });
    return;
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
        <Icon
          path={mdiChevronDown}
          size={1.1}
          onClick={ToggleProfileOptions}
          style={{ cursor: "pointer" }}
          className="toggleOptions"
        />
      </div>
      <ul className="profileOptions">
        <li>Log Out</li>
        <li>Profile</li>
      </ul>
    </header>
  );
};

export default AppHeader;
