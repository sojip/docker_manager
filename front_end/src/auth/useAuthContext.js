import { useContext, createContext } from "react";

export const AuthContext = createContext();
export const useAuthContext = () => {
  const auth = useContext(AuthContext);
  return auth;
};
