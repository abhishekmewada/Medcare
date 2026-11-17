import api from "../api/axios";

// Fetch current user's subscription and trial eligibility
export const getSubscriptionStatusApi = async () => {
  const response = await api.get("/subscription/status");
  return response.data;
};

// Subscribe to a plan (Monthly or Annual)
export const subscribeToPlanApi = async (plan = "monthly", paymentMethod = "upi") => {
  const response = await api.post("/subscription/subscribe", {
    plan,
    paymentMethod,
  });
  return response.data;
};

// Mark free 1-time trial as completed
export const completeFreeTrialApi = async (appointmentId, patientId = null) => {
  const response = await api.post("/subscription/complete-trial", {
    appointmentId,
    patientId,
  });
  return response.data;
};
