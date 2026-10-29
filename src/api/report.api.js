import api from "./axios";

export const createReport = async (formData) => {
  const response = await api.post(
    "/reports",
    formData
  );

  return response.data;
};

export const getMyReports = async () => {
  const response = await api.get(
    "/reports/my"
  );

  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(
    `/reports/${id}`
  );

  return response.data;
};