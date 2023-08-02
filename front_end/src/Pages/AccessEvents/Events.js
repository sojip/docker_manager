import { useState, useEffect } from "react";

export const Events = () => {
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
      let chunks = []; // array of received binary chunks (comprises the body)
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("done is true");
          break;
        }
        console.log(JSON.parse(value));
        // chunks.push(value);
      }
    })();
    return () => {
      controller.abort();
    };
    // const evtSource = new EventSource("/api/accesscontroller/events/subscribe");
    // evtSource.onopen = (e) => console.log("connection opened");
    // evtSource.onmessage = (e) => console.log(e);

    // return () => {
    //   evtSource.close();
    // };
  }, []);

  return (
    <div>
      <h1>Heelo</h1>
    </div>
  );
};
