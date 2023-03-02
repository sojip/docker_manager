import "../styles/Loader.css";
import { useEffect } from "react";

const Loader = () => {
  useEffect(() => {
    document.querySelector("body").style.overflowY = "hidden";
    return () => {
      let modal = document.querySelector(".modal");
      if (!modal) document.querySelector("body").style.overflowY = "auto";
    };
  }, []);

  return (
    <div className="LoaderWrapper">
      <div className="spinner"></div>
      <span>PLEASE WAIT...</span>
    </div>
  );
};

export default Loader;
