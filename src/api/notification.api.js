import api from "./axios";

export const getNotifications = async (params = {}) => {
  const response = await api.get(
    "/notifications?limit=10",
    { params }
  );

  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(
    `/notifications/${id}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(
    `/notifications/${id}`
  );

  return response.data;
};