import AuthContext from "./AuthContext";
import useAuthListener from "./useAuthListener";

const AuthProvider = ({ children }) => {
  const { ischecking, user, setuser } = useAuthListener();
  return (
    <AuthContext.Provider
      value={ischecking ? undefined : { user: user, setuser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
