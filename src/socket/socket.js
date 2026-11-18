import { io } from "socket.io-client";
import { getOrCreateDeviceId, getActiveSessionId } from "../utiles/deviceId";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://medcare-backend-yuiv.onrender.com";

const getAuthToken = () => {
  try {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch (e) {
    return "";
  }
};

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: (cb) => {
    cb({
      token: getAuthToken(),
      sessionId: getActiveSessionId(),
      deviceId: getOrCreateDeviceId(),
    });
  },
  query: {
    token: getAuthToken(),
    sessionId: getActiveSessionId(),
    deviceId: getOrCreateDeviceId(),
  },
});

export const identifyUser = (user, token, sessionId) => {
  const authToken = token || getAuthToken();
  const activeSessionId = sessionId || getActiveSessionId();
  const deviceId = getOrCreateDeviceId();
  const userId = user?._id || user?.id;
  const role = user?.role;

  const payload = {
    token: authToken,
    userId: userId?.toString ? userId.toString() : userId,
    role,
    sessionId: activeSessionId,
    deviceId,
  };

  if (socket.connected) {
    socket.emit("user:identify", payload);
  } else {
    socket.auth = {
      token: authToken,
      sessionId: activeSessionId,
      deviceId,
    };
    socket.connect();
    socket.once("connect", () => {
      socket.emit("user:identify", payload);
    });
  }
};

socket.on("connect", () => {
  console.log("🟢 [Socket.io] Connected to backend. ID:", socket.id);
  const token = getAuthToken();
  const sessionId = getActiveSessionId();
  const deviceId = getOrCreateDeviceId();
  if (token) {
    socket.emit("user:identify", { token, sessionId, deviceId });
  }
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ [Socket.io] Connection error:", err.message);
});

export const connectSocket = (user, token, sessionId) => {
  const authToken = token || getAuthToken();
  const activeSessionId = sessionId || getActiveSessionId();
  const deviceId = getOrCreateDeviceId();
  socket.auth = {
    token: authToken,
    sessionId: activeSessionId,
    deviceId,
  };
  if (!socket.connected) {
    socket.connect();
  }
  if (user) {
    identifyUser(user, authToken, activeSessionId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
