import api from "./axios";

// Fetch patient's medical records
export const getMyMedicalRecordsApi = async () => {
  try {
    const response = await api.get("/medical-records/my");
    return response.data;
  } catch (err) {
    // If backend route is mounted at root GET /medical-records
    if (err.response?.status === 404) {
      const fallback = await api.get("/medical-records");
      return fallback.data;
    }
    throw err;
  }
};

// Upload record with attachment (multipart/form-data)
export const uploadMedicalRecordApi = async (formData) => {
  const response = await api.post("/medical-records", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete record
export const deleteMedicalRecordApi = async (recordId) => {
  const response = await api.delete(`/medical-records/${recordId}`);
  return response.data;
};