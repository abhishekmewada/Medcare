import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth.service";
import { logout } from "../redux/slice/authSlice";
import { disconnectSocket } from "../socket/socket";

/**
 * useLogout
 * Custom hook to handle secure logout flow with confirmation modal
 * and proper cleanup of local storage, cookies, sockets, and Redux state.
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLogout = () => {
    setIsOpen(true);
  };

  const cancelLogout = () => {
    if (!loading) {
      setIsOpen(false);
    }
  };

  const confirmLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (error) {
      console.warn(
        "Backend logout notice (proceeding with local cleanup):",
        error?.response?.data || error?.message
      );
    } finally {
      // 1. Remove all stored tokens and sessions
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
      } catch (e) {
        console.error("Storage cleanup failed:", e);
      }

      // 2. Disconnect any active real-time socket
      try {
        disconnectSocket();
      } catch (e) {
        console.error("Socket disconnect failed:", e);
      }

      // 3. Clear Redux auth state (user -> null, isAuthenticated -> false)
      dispatch(logout());

      setLoading(false);
      setIsOpen(false);

      // 4. Redirect to login page and replace navigation history so back button cannot re-enter
      navigate("/login", { replace: true });
    }
  };

  return {
    isOpen,
    loading,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
};

export default useLogout;
