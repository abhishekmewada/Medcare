import api from "./axios";

export const createReview = async (data) => {
  const response = await api.post(
    "/reviews",
    data
  );

  return response.data;
};

export const getDoctorReviews = async (doctorId) => {
  const response = await api.get(
    `/reviews/doctor/${doctorId}`
  );

  return response.data;
};

export const updateReview = async (id, data) => {
  const response = await api.put(
    `/reviews/${id}`,
    data
  );

  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(
    `/reviews/${id}`
  );

  return response.data;
};