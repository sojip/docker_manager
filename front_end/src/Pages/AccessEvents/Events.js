import { useState, useEffect } from "react";
import { useEventsSubscribe } from "./useEventsSubscribe";
import { useRecords } from "./useRecords";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Event } from "./Event";
import "./Events.css";
import { toast, ToastContainer } from "react-toastify";
import { Spinner } from "../../components/Spinner";

export const Events = () => {
  const [isLoading, setisLoading] = useState(true);
  const [uievents, setuievents] = useState([]);
  const [checkInSearchPosition, setcheckInSearchPosition] = useState(undefined);
  const [checkOutSearchPosition, setcheckOutSearchPosition] =
    useState(undefined);
  // const checkInEvents = useEventsSubscribe(
  //   `/api/accesscontroller/${process.env.REACT_APP_CHECKIN_TERMINAL_IP}/events/subscribe`
  // );
  // const checkOutEvents = useEventsSubscribe(
  //   `/api/accesscontroller/${process.env.REACT_APP_CHECKOUT_TERMINAL_IP}/events/subscribe`
  // );
  const checkInRecords = useRecords(
    `/api/accesscontroller/${process.env.REACT_APP_CHECKIN_TERMINAL_IP}/events/records`,
    checkInSearchPosition
  );
  const checkOutRecords = useRecords(
    `/api/accesscontroller/${process.env.REACT_APP_CHECKOUT_TERMINAL_IP}/events/records`,
    checkOutSearchPosition
  );

  /** Get Total Number of Records then set search position to get the last ten */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      try {
        const responses = await Promise.all([
          fetch(
            `/api/accesscontroller/${process.env.REACT_APP_CHECKIN_TERMINAL_IP}/events/records/total`,
            {
              signal: signal,
            }
          ),
          fetch(
            `/api/accesscontroller/${process.env.REACT_APP_CHECKOUT_TERMINAL_IP}/events/records/total`,
            {
              signal: signal,
            }
          ),
        ]);
        const data = await Promise.all(
          responses.map((response) => response.json())
        );
        setcheckInSearchPosition(data[0].totalNum - 10);
        setcheckOutSearchPosition(data[1].totalNum - 10);
      } catch (e) {
        if (e.name === "AbortError") return;
        toast.error(e.message);
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  /** Merge real time and recorded events in descending order */
  useEffect(() => {
    if (checkInRecords !== undefined && checkOutRecords !== undefined) {
      setisLoading(false);
      setuievents(
        [
          // ...checkInEvents.map((evt) => {
          //   return { ...evt, type: "checkin" };
          // }),
          // ...checkOutEvents.map((evt) => {
          //   return { ...evt, type: "checkout" };
          // }),
          ...checkInRecords.map((evt) => {
            return { ...evt, type: "checkin" };
          }),
          ...checkOutRecords.map((evt) => {
            return { ...evt, type: "checkout" };
          }),
        ].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      );
    }

    console.log("Effect executed");
  }, [checkInRecords, checkOutRecords]);

  const getNextEvents = (e) => {
    setisLoading(true);
    setcheckInSearchPosition((prev) => prev - 10);
    setcheckOutSearchPosition((prev) => prev - 10);
  };

  const getPreviousEvents = (e) => {
    setisLoading(true);
    setcheckInSearchPosition((prev) => prev + 10);
    setcheckOutSearchPosition((prev) => prev + 10);
  };

  return (
    <>
      <ToastContainer />
      <h1>Access Events</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="navigation arrows">
            <i
              className="fa-solid fa-angle-left"
              onClick={getPreviousEvents}
            ></i>
            <i className="fa-solid fa-angle-right" onClick={getNextEvents}></i>
          </div>
          <TransitionGroup>
            {uievents.map((event) => {
              return (
                <CSSTransition
                  timeout={300}
                  classNames="fade"
                  unmountOnExit
                  in={true}
                  key={event.id}
                >
                  <Event {...event} />
                </CSSTransition>
              );
            })}
          </TransitionGroup>
        </>
      )}
    </>
  );
};
