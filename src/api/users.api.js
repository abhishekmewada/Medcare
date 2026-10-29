import api from "./axios";

export const getProfile = async () => {
  const response = await api.get("/users/profile");

  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put(
    "/users/profile",
    formData
  );

  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);

  return response.data;
};

export const updateUser = async (id, formData) => {
  const response = await api.put(
    `/users/${id}`,
    formData
  );

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);

  return response.data;
};

export const blockUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/block`
  );

  return response.data;
};

export const unblockUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/unblock`
  );

  return response.data;
};