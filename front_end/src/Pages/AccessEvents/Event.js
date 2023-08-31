import { DateTime } from "luxon";

export const Event = (props) => {
  const { photo, userName, dateTime, type } = props;
  return (
    <div className="event">
      <img src={photo} alt="" />
      <div>{userName}</div>
      <div>
        {DateTime.fromISO(dateTime).setLocale("fr").toLocaleString({
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <div>
        {DateTime.fromISO(dateTime).setLocale("fr").toLocaleString({
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
      <div>{type}</div>
    </div>
  );
};
