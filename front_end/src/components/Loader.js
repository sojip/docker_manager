import "../styles/Loader.css";
import { useEffect } from "react";

const Loader = (props) => {
  const { isActive } = props;

  useEffect(() => {
    if (isActive) document.querySelector("body").style.overflowY = "hidden";
    return () => {
      let modal = document.querySelector(".modal");
      if (modal === undefined || modal === null)
        document.querySelector("body").style.overflowY = "auto";
    };
  }, [isActive]);

  return isActive ? (
    <div className="LoaderWrapper">
      <div className="spinner"></div>
      <span>PLEASE WAIT...</span>
    </div>
  ) : (
    <></>
  );
};

export default Loader;
