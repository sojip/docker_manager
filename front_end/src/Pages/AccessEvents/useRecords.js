import { useEffect, useState } from "react";
import { v4 } from "uuid";

export const useRecords = (url, searchPosition) => {
  const [records, setrecords] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (searchPosition) {
      console.log(searchPosition);
      (async () => {
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ searchPosition }),
          signal: signal,
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
    return () => {
      controller.abort();
    };
  }, [url, searchPosition]);
  return records;
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
    uid: employee?._id,
    photo: employee?.photo,
    userName: `${employee?.firstname} ${employee?.lastname}`,
    dateTime: info.time,
  };
}
