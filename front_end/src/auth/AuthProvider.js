import { AuthContext } from "./useAuthContext";
import useAuthListener from "./useAuthListener";

const AuthProvider = ({ children }) => {
  const { ischecking, user, setuser } = useAuthListener();
  return (
    <AuthContext.Provider value={{ ischecking, user, setuser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
