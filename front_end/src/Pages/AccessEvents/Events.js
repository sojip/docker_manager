import { useState, useEffect } from "react";
// import { useCheckInSubscribe } from "./useCheckInSubscribe";
// import { useCheckOutSubscribe } from "./useCheckOutSubscribe";
import { useEventsSubscribe } from "./useEventsSubscribe";
import { useRecords } from "./useRecords";
import { TransitionGroup } from "react-transition-group";
import { Event } from "./Event";
import { v4 } from "uuid";
import "./Events.css";

export const Events = () => {
  // const { checkInEvents } = useCheckInSubscribe();
  // const { checkOutEvents } = useCheckOutSubscribe();
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

  // const [records, setrecords] = useState([]);
  // const [checkInrecords, setcheckInrecords] = useState([]);
  // const [checkOutrecords, setcheckOutrecords] = useState([]);
  const [uievents, setuievents] = useState([]);
  // const [searchPosition, setsearchPosition] = useState(undefined);

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

  /** Get the recorded events based on search position */
  // useEffect(() => {
  //   const controller = new AbortController();
  //   const signal = controller.signal;
  //   if (searchPosition) {
  //     (async () => {
  //       const resp = await fetch("/api/accesscontroller/events/records", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ searchPosition }),
  //         signal: signal,
  //       });
  //       const data = await resp.json();
  //       if (data.AcsEvent.InfoList.length > 0) {
  //         const infosList = data.AcsEvent.InfoList.map((info) => {
  //           return addUserDetails(info);
  //         });
  //         const records = await Promise.all(infosList);
  //         setrecords(records.toReversed());
  //       }
  //     })();
  //   }
  //   return () => {
  //     controller.abort();
  //   };
  // }, [searchPosition]);

  /** Merge real time and recorded events in descending order */
  useEffect(() => {
    // setuievents(
    //   checkInEvents
    //     .concat(checkOutEvents, checkInRecords, checkOutRecords)
    //     .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    // );
    setuievents(
      checkInRecords
        .concat(checkOutRecords)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    );
  }, [checkInRecords, checkOutRecords]);

  return (
    <>
      <h1>Access Events</h1>
      <TransitionGroup>
        {uievents.map((event) => {
          return <Event key={event.id} {...event} />;
        })}
      </TransitionGroup>
    </>
  );
};

/**
 *
 * Helpers
 */

async function addUserDetails(info) {
  // console.log(info);
  const resp = await fetch(`/api/workers/event/${info.employeeNoString}`);
  const employee = await resp.json();
  return {
    ...info,
    id: v4(),
    uid: employee._id,
    photo: employee.photo,
    userName: `${employee.firstname} ${employee.lastname}`,
    dateTime: info.time,
  };
}
