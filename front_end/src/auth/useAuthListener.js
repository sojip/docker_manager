import { useState, useEffect } from "react";

const useAuthListener = () => {
  const [user, setuser] = useState(null);
  const [ischecking, setischecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let signal = controller.signal;
    fetch("/api/refresh_token", {
      signal: signal,
    })
      .then((res) => {
        //if access unauthorized, it means user should be log out
        if (res.status === 401) {
          setischecking(false);
          setuser(null);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data === undefined) return;
        setuser({
          id: data.user._id,
          access_token: data.access_token,
        });
        setischecking(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        alert(e);
      });

    return () => {
      controller.abort();
    };
  }, []);
  return {
    ischecking,
    user,
    setuser,
  };
};

export default useAuthListener;
