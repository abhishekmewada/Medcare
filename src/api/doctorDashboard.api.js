import api from "./axios";

export const getDoctorDashboardApi = async () => {
  const response = await api.get(
    "/appointments/doctor/dashboard"
  );

  return response.data;
};