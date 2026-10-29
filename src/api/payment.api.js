import api from "./axios";

export const createPaymentOrder = async (data) => {
  const response = await api.post(
    "/payments/create-order",
    data
  );

  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await api.post(
    "/payments/verify",
    data
  );

  return response.data;
};