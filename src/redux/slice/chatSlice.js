import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getOrCreateConversationApi,
  getMyConversationsApi,
  getEligibleContactsApi,
  getAdminDoctorContactsApi,
  getConversationByIdApi,
  getConversationMessagesApi,
  sendMessageApi,
  markMessageAsReadApi,
  markConversationAsReadApi,
  closeConversationApi,
} from "../../api/chat.api";

// ==========================================
// GET OR CREATE CONVERSATION
// ==========================================

export const getOrCreateConversation = createAsyncThunk(
  "chat/getOrCreateConversation",
  async (params, { rejectWithValue }) => {
    try {
      const data = await getOrCreateConversationApi(params);

      return data.conversation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create conversation"
      );
    }
  }
);

// ==========================================
// GET ELIGIBLE CONTACTS
// ==========================================

export const fetchContacts = createAsyncThunk(
  "chat/fetchContacts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEligibleContactsApi();

      return data.contacts || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch contacts"
      );
    }
  }
);

// ==========================================
// GET ADMIN-DOCTOR SUPPORT CONTACTS
// ==========================================

export const fetchAdminDoctorContacts = createAsyncThunk(
  "chat/fetchAdminDoctorContacts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminDoctorContactsApi();

      return data.contacts || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch support contacts"
      );
    }
  }
);

// ==========================================
// GET MY CONVERSATIONS
// ==========================================

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyConversationsApi();

      return data.conversations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch conversations"
      );
    }
  }
);

// ==========================================
// GET SINGLE CONVERSATION
// ==========================================

export const fetchConversation = createAsyncThunk(
  "chat/fetchConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      const data =
        await getConversationByIdApi(
          conversationId
        );

      return data.conversation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch conversation"
      );
    }
  }
);

// ==========================================
// GET MESSAGES
// ==========================================

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const data =
        await getConversationMessagesApi(
          conversationId
        );

      return data.messages || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch messages"
      );
    }
  }
);

// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await sendMessageApi(payload);
      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

// ==========================================
// MARK MESSAGE AS READ
// ==========================================

export const markMessageAsRead = createAsyncThunk(
  "chat/markMessageAsRead",
  async (messageId, { rejectWithValue }) => {
    try {
      const data =
        await markMessageAsReadApi(messageId);

      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark message as read"
      );
    }
  }
);

// ==========================================
// MARK CONVERSATION AS READ
// ==========================================

export const markConversationAsRead = createAsyncThunk(
  "chat/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const data =
        await markConversationAsReadApi(
          conversationId
        );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark conversation as read"
      );
    }
  }
);

// ==========================================
// CLOSE CONVERSATION
// ==========================================

export const closeConversation = createAsyncThunk(
  "chat/closeConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      const data =
        await closeConversationApi(
          conversationId
        );

      return data.conversation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to close conversation"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  conversations: [],
  currentConversation: null,
  selectedConversationId: null,
  messages: [],
  contacts: [],
  adminContacts: [],
  contactsLoading: false,

  loading: false,
  messagesLoading: false,

  error: null,
};

// ==========================================
// SLICE
// ==========================================

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    selectConversation: (state, action) => {
      state.selectedConversationId = action.payload;
      if (action.payload) {
        const conv = state.conversations.find(
          (c) => c._id?.toString() === action.payload?.toString()
        );
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    },

    // Socket.IO new message
    addMessage: (state, action) => {
      const message = action.payload;
      const convId =
        message?.conversation?._id?.toString() ||
        message?.conversation?.toString();

      if (
        state.selectedConversationId &&
        convId &&
        state.selectedConversationId.toString() === convId
      ) {
        const exists = state.messages.some(
          (item) => item._id === message._id
        );

        if (!exists) {
          state.messages.push(message);
        }
      }

      if (convId) {
        const convIndex = state.conversations.findIndex(
          (c) => c._id?.toString() === convId
        );

        if (convIndex !== -1) {
          const conv = { ...state.conversations[convIndex] };
          conv.lastMessage =
            message.messageType === "text"
              ? message.message
              : `[${message.messageType}]`;
          conv.lastMessageAt = message.createdAt;

          if (
            !state.selectedConversationId ||
            state.selectedConversationId.toString() !== convId
          ) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }

          state.conversations.splice(convIndex, 1);
          state.conversations.unshift(conv);
        }
      }
    },

    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.error = null;
    },

    clearChatError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // GET / CREATE CONVERSATION
    // ========================================

    builder
      .addCase(
        getOrCreateConversation.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getOrCreateConversation.fulfilled,
        (state, action) => {
          state.loading = false;
          state.currentConversation =
            action.payload;
            state.selectedConversationId =
      action.payload._id;

          const exists =
            state.conversations.some(
              (conversation) =>
                conversation._id ===
                action.payload._id
            );

          if (!exists) {
            state.conversations.unshift(
              action.payload
            );
          }
        }
      )

      .addCase(
        getOrCreateConversation.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    // ========================================
    // FETCH CONVERSATIONS
    // ========================================

    builder
      .addCase(
        fetchConversations.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchConversations.fulfilled,
        (state, action) => {
          state.loading = false;
          state.conversations =
            action.payload;
        }
      )

      .addCase(
        fetchConversations.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    // ========================================
    // FETCH CONTACTS
    // ========================================

    builder
      .addCase(fetchContacts.pending, (state) => {
        state.contactsLoading = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contactsLoading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.error = action.payload;
      });

    // ========================================
    // FETCH ADMIN-DOCTOR CONTACTS
    // ========================================

    builder
      .addCase(fetchAdminDoctorContacts.fulfilled, (state, action) => {
        state.adminContacts = action.payload;
      });

    // ========================================
    // FETCH SINGLE CONVERSATION
    // ========================================

    builder
      .addCase(
        fetchConversation.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        fetchConversation.fulfilled,
        (state, action) => {
          state.currentConversation =
            action.payload;
        }
      )

      .addCase(
        fetchConversation.rejected,
        (state, action) => {
          state.error = action.payload;
        }
      );

    // ========================================
    // FETCH MESSAGES
    // ========================================

    builder
      .addCase(
        fetchMessages.pending,
        (state) => {
          state.messagesLoading = true;
          state.error = null;
          state.messages = [];
        }
      )

      .addCase(
        fetchMessages.fulfilled,
        (state, action) => {
          state.messagesLoading = false;
          state.messages =
            action.payload;
        }
      )

      .addCase(
        fetchMessages.rejected,
        (state, action) => {
          state.messagesLoading = false;
          state.error = action.payload;
        }
      );

    // ========================================
    // SEND MESSAGE
    // ========================================

    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const message = action.payload;
      if (!message) return;

      const convId =
        message?.conversation?._id?.toString() ||
        message?.conversation?.toString();

      if (
        state.selectedConversationId &&
        convId &&
        state.selectedConversationId.toString() === convId
      ) {
        const exists = state.messages.some((item) => item._id === message._id);
        if (!exists) {
          state.messages.push(message);
        }
      }

      if (convId) {
        const convIndex = state.conversations.findIndex(
          (c) => c._id?.toString() === convId
        );
        if (convIndex !== -1) {
          const conv = { ...state.conversations[convIndex] };
          conv.lastMessage = message.message;
          conv.lastMessageAt = message.createdAt;
          state.conversations.splice(convIndex, 1);
          state.conversations.unshift(conv);
        }
      }
    });

    // ========================================
    // MARK MESSAGE READ
    // ========================================

    builder.addCase(
      markMessageAsRead.fulfilled,
      (state, action) => {
        const updatedMessage =
          action.payload;

        const index =
          state.messages.findIndex(
            (message) =>
              message._id ===
              updatedMessage._id
          );

        if (index !== -1) {
          state.messages[index] =
            updatedMessage;
        }
      }
    );

    // ========================================
    // CLOSE CONVERSATION
    // ========================================

    builder.addCase(
      closeConversation.fulfilled,
      (state, action) => {
        state.currentConversation =
          action.payload;

        const index =
          state.conversations.findIndex(
            (conversation) =>
              conversation._id ===
              action.payload._id
          );

        if (index !== -1) {
          state.conversations[index] =
            action.payload;
        }
      }
    );
  },
});

export const {
  selectConversation,
  addMessage,
  clearCurrentConversation,
  clearChatError,

} = chatSlice.actions;

export default chatSlice.reducer;