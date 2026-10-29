import api from "./axios";

// Get logged-in patient's prescriptions
export const getMyPrescriptionsApi = async (params = {}) => {
  const response = await api.get("/prescription/my", { params });
  return response.data;
};

// Get doctor's issued prescriptions
export const getDoctorPrescriptionsApi = async () => {
  const response = await api.get("/prescription/doctor");
  return response.data;
};

// Issue new prescription (Doctor)
export const createPrescriptionApi = async (prescriptionData) => {
  const response = await api.post("/prescription", prescriptionData);
  return response.data;
};

// Request refill (Patient)
export const requestPrescriptionRefillApi = async (prescriptionId) => {
  const response = await api.patch(`/prescription/${prescriptionId}/refill`);
  return response.data;
};