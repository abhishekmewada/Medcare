import api from "./axios";

export const saveWeeklyAvailabilityApi = async (
  availability
) => {
  const response = await api.put(
    "/availability/weekly",
    {
      availability,
    }
  );

  return response.data;
};

export const getDoctorAvailabilityApi = async (
  doctorId
) => {
  const response = await api.get(
    `/availability/doctor/${doctorId}`
  );

  return response.data;
};
