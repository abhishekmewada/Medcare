import api from "./axios";

// Create / get conversation
export const getOrCreateConversationApi = async (
  param1,
  param2
) => {
  const payload =
    typeof param1 === "object" && param1 !== null
      ? param1
      : { doctorId: param1, appointmentId: param2 };

  const response = await api.post(
    "/chat/conversation",
    payload
  );

  return response.data;
};

// Get eligible chat contacts
export const getEligibleContactsApi = async () => {
  const response = await api.get(
    "/chat/contacts"
  );

  return response.data;
};

// Get admin-doctor support contacts
export const getAdminDoctorContactsApi = async () => {
  const response = await api.get(
    "/chat/support-contacts"
  );

  return response.data;
};

// Get my conversations
export const getMyConversationsApi = async () => {
  const response = await api.get(
    "/chat/conversations"
  );

  return response.data;
};

// Get single conversation
export const getConversationByIdApi = async (
  conversationId
) => {
  const response = await api.get(
    `/chat/conversation/${conversationId}`
  );

  return response.data;
};

// Get conversation messages
export const getConversationMessagesApi = async (
  conversationId
) => {
  const response = await api.get(
    `/chat/conversation/${conversationId}/messages`
  );

  return response.data;
};

// Send message
export const sendMessageApi = async (data) => {
  const response = await api.post(
    "/chat/message",
    data
  );

  return response.data;
};

// Mark single message as read
export const markMessageAsReadApi = async (
  messageId
) => {
  const response = await api.patch(
    `/chat/message/${messageId}/read`
  );

  return response.data;
};

// Mark conversation as read
export const markConversationAsReadApi = async (
  conversationId
) => {
  const response = await api.patch(
    `/chat/conversation/${conversationId}/read`
  );

  return response.data;
};

// Close conversation
export const closeConversationApi = async (
  conversationId
) => {
  const response = await api.patch(
    `/chat/conversation/${conversationId}/close`
  );

  return response.data;
};