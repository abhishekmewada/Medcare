import api from "./axios";

// ==========================================
// DASHBOARD
// ==========================================

export const getDashboardApi = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// ==========================================
// USERS
// ==========================================

export const getAllUsersApi = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

// ==========================================
// DOCTORS
// ==========================================

export const getAllDoctorsApi = async () => {
  const response = await api.get("/admin/doctors");
  return response.data;
};

export const approveDoctorApi = async (id) => {
  const response = await api.patch(`/admin/doctors/${id}/approve`);
  return response.data;
};

export const rejectDoctorApi = async (id, data) => {
  const response = await api.patch(`/admin/doctors/${id}/reject`, data);
  return response.data;
};

export const updateDoctorStatusApi = async (id, data) => {
  const response = await api.patch(`/admin/doctors/${id}/status`, data);
  return response.data;
};

// ==========================================
// PATIENTS
// ==========================================

export const getAllPatientsApi = async () => {
  const response = await api.get("/admin/patients");
  return response.data;
};

// ==========================================
// BLOCK / UNBLOCK
// ==========================================

export const toggleUserBlockApi = async (id) => {
  const response = await api.patch(`/admin/users/${id}/block`);
  return response.data;
};

// ==========================================
// DELETE USER
// ==========================================

export const deleteUserApi = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// ==========================================
// APPOINTMENTS
// ==========================================

export const getAllAppointmentsApi = async () => {
  const response = await api.get("/admin/appointments");
  return response.data;
};

// ==========================================
// ANALYTICS
// ==========================================

export const getAnalyticsApi = async () => {
  const response = await api.get("/admin/analytics");
  return response.data;
};

// ==========================================
// AUDIT LOGS
// ==========================================

export const getAuditLogsApi = async () => {
  const response = await api.get("/admin/audit-logs");
  return response.data;
};

// ==========================================
// CHAT CONVERSATIONS (admin oversight)
// ==========================================

export const getAdminConversationsApi = async () => {
  const response = await api.get("/admin/conversations");
  return response.data;
};