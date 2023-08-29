import { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { DateTime } from "luxon";

export const Event = (props) => {
  const { photo, userName, dateTime, AccessControllerEvent } = props;
  console.log(props);
  const eventRef = useRef(null);
  return (
    <CSSTransition
      nodeRef={eventRef}
      timeout={500}
      classNames="fade"
      unmountOnExit
      in={true}
    >
      <div className="event" ref={eventRef}>
        <img src={photo} alt="" />
        <div>{userName}</div>
        <div>
          {DateTime.fromISO(dateTime)
            // .plus({ hours: 8 })
            .setLocale("fr")
            .toLocaleString({
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </div>
        <div>
          {DateTime.fromISO(dateTime)
            // .plus({ hours: 7 })
            .setLocale("fr")
            .toLocaleString({
              hour: "numeric",
              minute: "2-digit",
            })}
        </div>
        {AccessControllerEvent?.deviceName ===
        process.env.REACT_APP_CHECKINREADER ? (
          <div>Check In</div>
        ) : (
          <div>Check Out</div>
        )}
      </div>
    </CSSTransition>
  );
};
