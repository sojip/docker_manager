import { useContext } from "react";
import AuthContext from "./AuthContext";

const useAuthContext = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default useAuthContext;
