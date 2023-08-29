import { useState, useEffect } from "react";
import { useSubscribe } from "./useSubscribe";
import { TransitionGroup } from "react-transition-group";
import { Event } from "./Event";
import { v4 } from "uuid";
import "./Events.css";
// Settings.defaultZone = "UTC+1";

export const Events = () => {
  const { events } = useSubscribe();
  const [records, setrecords] = useState([]);
  const [uievents, setuievents] = useState([]);
  const [searchPosition, setsearchPosition] = useState(undefined);

  /** Get Total Number of Event then set search position to get the last ten */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      const resp = await fetch("/api/accesscontroller/events/total", {
        signal: signal,
      });
      const data = await resp.json();
      const total = data.totalNum;
      setsearchPosition(total - 10);
    })();
    return () => {
      controller.abort();
    };
  }, []);

  /** Get the recorded events based on search position */
  useEffect(() => {
    if (searchPosition) {
      (async () => {
        const resp = await fetch("/api/accesscontroller/events/records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ searchPosition }),
        });
        const data = await resp.json();
        if (data.AcsEvent.InfoList.length > 0) {
          const infosList = data.AcsEvent.InfoList.map((info) => {
            return addUserDetails(info);
          });
          const records = await Promise.all(infosList);
          setrecords(records.toReversed());
        }
      })();
    }
  }, [searchPosition]);

  /** Merge real time and recorded events in descengin order */
  useEffect(() => {
    setuievents(
      events
        .concat(records)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    );
    console.log(uievents);
  }, [events, records]);

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
