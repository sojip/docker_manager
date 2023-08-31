import { useState, useEffect } from "react";
import { useEventsSubscribe } from "./useEventsSubscribe";
import { useRecords } from "./useRecords";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Event } from "./Event";
import "./Events.css";

export const Events = () => {
  // const checkInEvents = useEventsSubscribe(
  //   "/api/accesscontroller/events/subscribe/checkin"
  // );
  // const checkOutEvents = useEventsSubscribe(
  //   "/api/accesscontroller/events/subscribe/checkout"
  // );
  const [checkInSearchPosition, setcheckInSearchPosition] = useState(null);
  const [checkOutSearchPosition, setcheckOutSearchPosition] = useState(null);
  const checkInRecords = useRecords(
    "/api/accesscontroller/events/records/checkin",
    checkInSearchPosition
  );
  const checkOutRecords = useRecords(
    "/api/accesscontroller/events/records/checkout",
    checkOutSearchPosition
  );
  const [uievents, setuievents] = useState([]);

  /** Get Total Number of Records then set search position to get the last ten */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      const responses = await Promise.all([
        fetch("/api/accesscontroller/records/checkin/total", {
          signal: signal,
        }),
        fetch("/api/accesscontroller/records/checkout/total", {
          signal: signal,
        }),
      ]);
      const data = await Promise.all(
        responses.map((response) => response.json())
      );
      setcheckInSearchPosition(data[0].totalNum - 10);
      setcheckOutSearchPosition(data[1].totalNum - 10);
    })();
    return () => {
      controller.abort();
    };
  }, []);

  /** Merge real time and recorded events in descending order */
  useEffect(() => {
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
  }, [checkInRecords, checkOutRecords]);

  useEffect(() => {
    console.log(uievents.length);
  }, [uievents]);

  const getNextEvents = (e) => {
    setcheckInSearchPosition((prev) => prev - 10);
    setcheckOutSearchPosition((prev) => prev - 10);
  };

  const getPreviousEvents = (e) => {
    setcheckInSearchPosition((prev) => prev + 10);
    setcheckOutSearchPosition((prev) => prev + 10);
  };

  return (
    <>
      <h1>Access Events</h1>
      <div className="navigation arrows">
        <i className="fa-solid fa-angle-left" onClick={getPreviousEvents}></i>
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
  );
};
