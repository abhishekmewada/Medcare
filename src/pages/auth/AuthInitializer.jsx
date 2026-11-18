import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
 
 
import { setUser, setAuthLoading, logout } from "../../redux/slice/authSlice";
import api from "../../api/axios";
import { connectSocket, disconnectSocket, identifyUser } from "../../socket/socket";
import { setActiveSessionId, clearActiveSessionId } from "../../utiles/deviceId";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const loading = useSelector(
    (state) => state.auth.loading
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me")
        console.log("ME RESPONSE:", response.data);

        if (response.data?.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        if (response.data?.sessionId) {
          setActiveSessionId(response.data.sessionId);
        }

        dispatch(setUser(response.data.user));
        connectSocket(
          response.data.user,
          response.data?.token,
          response.data?.sessionId
        );
        identifyUser(
          response.data.user,
          response.data?.token,
          response.data?.sessionId
        );
      } catch (error) {
        console.log("error message:", error.response?.data || error.message);
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        clearActiveSessionId();
        disconnectSocket();
        dispatch(logout());
      } finally{
          dispatch(setAuthLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500">
          Checking your session...
        </div>
      </div>
    ); 
  }

  return children;
};

export default AuthInitializer;