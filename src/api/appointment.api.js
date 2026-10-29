import api from "./axios";

// Create appointment
export const createAppointmentApi = async (data) => {
  const response = await api.post("/appointments", data);

  return response.data;
};

// Get patient appointments
export const getMyAppointmentsApi = async (params = {}) => {
  const response = await api.get("/appointments/my", { params });

  return response.data;
};

// Get doctor appointments
export const getDoctorAppointmentsApi = async () => {
  const response = await api.get("/appointments/doctor");

  return response.data;
};

// Update appointment status
export const updateAppointmentStatusApi = async (id, status) => {
  const response = await api.patch(
    `/appointments/${id}/status`,
    { status }
  );

  return response.data;
};

// Cancel appointment
export const cancelAppointmentApi = async (id) => {
  const response = await api.patch(
    `/appointments/${id}/cancel`
  );
  console.log("cancelAppointmentApi response:", response.data); 

  return response.data;
 };