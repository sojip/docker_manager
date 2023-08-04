import { useState, useEffect } from "react";

export const useSubscribe = () => {
  const [events, setevents] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      const response = await fetch("/api/accesscontroller/events/subscribe", {
        signal: signal,
      });
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
          let chunks = processChunkString(value);
          let values = await Promise.all(
            chunks.map((chunk) => getJSON(chunk, { signal: signal }))
          );
          let _events = values.filter((value) => value !== null);
          if (_events.length > 0)
            setevents((events) => [...events, ..._events]);
        } catch (e) {
          console.log(e.message);
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  return { events };
};

function parseChunk(value) {
  return value
    .replace(/--boundary/g, "")
    .replace(/Content-Length: [0-9]+/i, "")
    .replace('Content-Type: application/json; charset="UTF-8"', "")
    .trim();
}

// In case there are may events grouped in one string
function processChunkString(chunk) {
  let events = [];
  let chunks = chunk.split("--boundary");
  console.log(chunks);
  for (let i = 0; i < chunks.length; i = i + 2) {
    if (chunks[i + 1] !== undefined) {
      events.push(chunks[i + 1]);
    }
  }
  return events;
}

async function getJSON(chunk, { signal }) {
  let value = JSON.parse(parseChunk(chunk));
  let employeeNoString = value?.AccessControllerEvent?.employeeNoString;
  if (employeeNoString) {
    let employee = await fetch(`/api/workers/event/${employeeNoString}`, {
      signal: signal,
    });
    employee = await employee.json();
    value.userName = `${employee.firstname} ${employee.lastname}`;
    return value;
  }
  return null;
}
