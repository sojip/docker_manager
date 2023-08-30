import { useState, useEffect } from "react";
import { v4 } from "uuid";

export const useCheckOutSubscribe = () => {
  const [checkOutEvents, setevents] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      const response = await fetch(
        "/api/accesscontroller/events/subscribe/checkout",
        {
          signal: signal,
        }
      );
      const reader = response.body
        .pipeThrough(new window.TextDecoderStream())
        .getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("done is true");
          break;
        }
        try {
          let chunks = extractChunks(value);
          let datas = await Promise.all(
            chunks.map((chunk) => getJSON(chunk, { signal: signal }))
          );
          let _events = datas.filter((data) => data !== null);
          if (_events.length > 0)
            setevents((events) => [..._events, ...events]);
        } catch (e) {
          console.log(e.message);
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  return { checkOutEvents };
};

function parseChunk(value) {
  return value
    .replace(/--boundary/g, "")
    .replace(/Content-Length: [0-9]+/i, "")
    .replace('Content-Type: application/json; charset="UTF-8"', "")
    .trim();
}

// In case there are may events grouped in one string
function extractChunks(value) {
  let chunks = [];
  let values = value.split("--boundary");
  for (let i = 0; i < values.length; i = i + 2) {
    if (values[i + 1] !== undefined) {
      chunks.push(values[i + 1]);
    }
  }
  return chunks;
}

async function getJSON(chunk, { signal }) {
  let value = JSON.parse(parseChunk(chunk));
  let employeeNoString = value?.AccessControllerEvent?.employeeNoString;
  if (employeeNoString) {
    let employee = await fetch(`/api/workers/event/${employeeNoString}`, {
      signal: signal,
    });
    employee = await employee.json();
    value.uid = employee._id;
    value.photo = employee.photo;
    value.userName = `${employee.firstname} ${employee.lastname}`;
    value.id = v4();
    return value;
  }
  return null;
}
