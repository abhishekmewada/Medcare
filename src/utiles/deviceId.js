const DEVICE_ID_KEY = "medcare_device_id";
const SESSION_ID_KEY = "medcare_session_id";

/**
 * Returns a persistent unique device identifier for this browser/device.
 */
export const getOrCreateDeviceId = () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (e) {
    return `dev-temp-${Date.now()}`;
  }
};

/**
 * Returns a clean human-readable description of the current browser & OS.
 */
export const getDeviceInfo = () => {
  try {
    const ua = navigator.userAgent || "";
    let browser = "Browser";
    if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome/")) browser = "Google Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/")) browser = "Safari";

    let os = "Device";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";

    return `${browser} on ${os}`;
  } catch (e) {
    return "Web Browser";
  }
};

export const getActiveSessionId = () => {
  try {
    return localStorage.getItem(SESSION_ID_KEY) || "";
  } catch (e) {
    return "";
  }
};

export const setActiveSessionId = (sessionId) => {
  try {
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const clearActiveSessionId = () => {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (e) {
    // ignore storage errors
  }
};
