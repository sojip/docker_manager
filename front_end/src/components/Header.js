import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import { mdiMenu } from "@mdi/js";
import { mdiAccountTie } from "@mdi/js";
import "../styles/AppHeader.css";
import { useEffect } from "react";
import { useAuthContext } from "../auth/useAuthContext";

const Header = () => {
  const auth = useAuthContext();

  useEffect(() => {
    function closeprofileOptions(e) {
      let isopened = document.querySelector(".profileOptions.isopened");
      let optionsButton = document.querySelector(".toggleOptions");
      if (e.target !== optionsButton && !optionsButton.contains(e.target)) {
        isopened?.classList.remove("isopened");
      }
    }
    window.addEventListener("click", closeprofileOptions);
    return () => {
      window.removeEventListener("click", closeprofileOptions);
    };
  }, []);

  function toggleProfileOptions(e) {
    let profileOptions = document.querySelector(".profileOptions");
    profileOptions.classList.toggle("isopened");
    return;
  }

  function toggleNav() {
    let nav = document.querySelector("nav");
    let descriptions = document.querySelectorAll(".navitemDesc");
    let main = document.querySelector(".main");
    nav.classList.toggle("grow");
    main.classList.toggle("shrink");
    descriptions.forEach((description) => {
      description.classList.toggle("show");
    });
    return;
  }

  function handleLogOut(e) {
    fetch("/api/auth/logout")
      .then(() => {
        auth.setuser(null);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  return (
    <header>
      <Icon
        path={mdiMenu}
        size={1}
        onClick={toggleNav}
        style={{ cursor: "pointer" }}
      />
      <h3>Welcome {auth.user.name}</h3>
      <div className="wrapper">
        <div className="profileImageContainer">
          <Icon path={mdiAccountTie} size={1} />
        </div>
        <div
          onClick={toggleProfileOptions}
          style={{ cursor: "pointer", display: "flex", alignitems: "center" }}
          className="toggleOptions"
        >
          <Icon path={mdiChevronDown} size={1.1} />
        </div>
      </div>
      <ul className="profileOptions">
        <li onClick={handleLogOut}>Log Out</li>
        {/* <li>Profile</li> */}
      </ul>
    </header>
  );
};

export default Header;
