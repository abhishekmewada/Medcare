import socket from "./socket";

// ==========================================
// JOIN CONVERSATION
// ==========================================

export const joinConversation = (
  conversationId
) => {
  socket.emit(
    "chat:join",
    conversationId
  );
};

// ==========================================
// LEAVE CONVERSATION
// ==========================================

export const leaveConversation = (
  conversationId
) => {
  socket.emit(
    "chat:leave",
    conversationId
  );
};

// ==========================================
// SEND MESSAGE
// ==========================================

export const sendChatMessage = ({
  conversationId,
  message,
  messageType = "text",
  attachments = [],
}) => {
  socket.emit("chat:message", {
    conversationId,
    message,
    messageType,
    attachments,
  });
};

// ==========================================
// TYPING
// ==========================================

export const startTyping = (
  conversationId
) => {
  socket.emit(
    "chat:typing",
    conversationId
  );
};

// ==========================================
// STOP TYPING
// ==========================================

export const stopTyping = (
  conversationId
) => {
  socket.emit(
    "chat:stopTyping",
    conversationId
  );
};

// ==========================================
// READ MESSAGE
// ==========================================

export const readChatMessage = (
  messageId
) => {
  socket.emit(
    "chat:read",
    messageId
  );
};