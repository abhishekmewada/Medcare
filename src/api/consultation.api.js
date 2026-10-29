import api from "./axios";

export const createConsultation = async (data) => {
  const response = await api.post(
    "/consultations",
    data
  );

  return response.data;
};

export const getConsultationByAppointment = async (
  appointmentId
) => {
  const response = await api.get(
    `/consultations/appointment/${appointmentId}`
  );

  return response.data;
};

export const updateConsultation = async (
  id,
  data
) => {
  const response = await api.put(
    `/consultations/${id}`,
    data
  );

  return response.data;
};