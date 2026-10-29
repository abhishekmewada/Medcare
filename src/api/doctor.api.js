import api from "./axios";

// ==========================================
// GET ALL DOCTORS - PUBLIC
// ==========================================

export const getDoctorsApi = async (params = {}) => {
  const response = await api.get("/doctors", { params });

  return response.data;
};


// ==========================================
// GET DOCTOR BY ID - PUBLIC
// ==========================================

export const getDoctorByIdApi = async (id) => {
  const response = await api.get(`/doctors/${id}`);

  return response.data;
};


// ==========================================
// GET DOCTOR PROFILE - DOCTOR
// ==========================================

export const getDoctorProfileApi = async () => {
  const response = await api.get("/doctors/profile/me");

  return response.data;
};


// ==========================================
// UPDATE OWN PROFILE - DOCTOR
// ==========================================

export const updateDoctorProfileApi = async (data) => {
  const response = await api.put(
    "/doctors/profile/me",
    data
  );

  return response.data;
};


// ==========================================
// CREATE DOCTOR - ADMIN
// ==========================================

export const createDoctorApi = async (data) => {
  const response = await api.post(
    "/doctors",
    data
  );

  return response.data;
};


// ==========================================
// UPDATE DOCTOR - ADMIN
// ==========================================

export const updateDoctorApi = async (id, data) => {
  const response = await api.put(
    `/doctors/${id}`,
    data
  );

  return response.data;
};


// ==========================================
// DELETE DOCTOR - ADMIN
// ==========================================

export const deleteDoctorApi = async (id) => {
  const response = await api.delete(
    `/doctors/${id}`
  );

  return response.data;
};


// ==========================================
// APPROVE DOCTOR - ADMIN
// ==========================================

export const approveDoctorApi = async (id) => {
  const response = await api.patch(
    `/doctors/${id}/approve`
  );

  return response.data;
};


// ==========================================
// REJECT DOCTOR - ADMIN
// ==========================================

export const rejectDoctorApi = async (id) => {
  const response = await api.patch(
    `/doctors/${id}/reject`
  );

  return response.data;
};