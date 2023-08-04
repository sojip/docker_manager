import { useState, useEffect } from "react";
import { useSubscribe } from "./useSubscribe";

export const Events = () => {
  const { events } = useSubscribe();
  console.log(events);

  useEffect(() => {}, [events]);

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
};
