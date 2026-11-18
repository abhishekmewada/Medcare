import axios from "axios";
import { getOrCreateDeviceId } from "../utiles/deviceId";

// Create Axios instance with base URL and credentials support
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Request interceptor: attach JWT token and persistent device ID
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['x-device-id'] = getOrCreateDeviceId();
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;