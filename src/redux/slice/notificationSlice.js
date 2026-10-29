import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notification.api";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};


// ==========================================
// FETCH NOTIFICATIONS
// ==========================================

export const fetchNotifications =
  createAsyncThunk(
    "notification/fetchNotifications",

    async (_, { rejectWithValue }) => {
      try {
        const data =
          await getNotifications();

        return data.notifications;

      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
          "Failed to fetch notifications"
        );
      }
    }
  );


// ==========================================
// MARK ONE AS READ
// ==========================================

export const markAsRead =
  createAsyncThunk(
    "notification/markAsRead",

    async (id, { rejectWithValue }) => {
      try {
        const data =
          await markNotificationAsRead(id);

        return data.notification;

      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
          "Failed to mark notification as read"
        );
      }
    }
  );


// ==========================================
// MARK ALL AS READ
// ==========================================

export const markAllAsRead =
  createAsyncThunk(
    "notification/markAllAsRead",

    async (_, { rejectWithValue }) => {
      try {
        await markAllNotificationsAsRead();

        return true;

      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
          "Failed to mark all notifications as read"
        );
      }
    }
  );


// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const removeNotification =
  createAsyncThunk(
    "notification/removeNotification",

    async (id, { rejectWithValue }) => {
      try {
        await deleteNotification(id);

        return id;

      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
          "Failed to delete notification"
        );
      }
    }
  );


// ==========================================
// SLICE
// ==========================================

const notificationSlice =
  createSlice({
    name: "notification",

    initialState,

   reducers: {
  addNotification: (state, action) => {
    state.notifications.unshift(action.payload);
  },

  clearNotifications: (state) => {
    state.notifications = [];
    state.error = null;
  },
},

    extraReducers: (builder) => {
      builder

        // ======================
        // FETCH
        // ======================

        .addCase(
          fetchNotifications.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchNotifications.fulfilled,
          (state, action) => {
            state.loading = false;
            state.notifications =
              action.payload || [];
          }
        )

        .addCase(
          fetchNotifications.rejected,
          (state, action) => {
            state.loading = false;
            state.error =
              action.payload;
          }
        )


        // ======================
        // MARK ONE AS READ
        // ======================

        .addCase(
          markAsRead.fulfilled,
          (state, action) => {
            const updatedNotification =
              action.payload;

            const index =
              state.notifications.findIndex(
                (notification) =>
                  notification._id ===
                  updatedNotification._id
              );

            if (index !== -1) {
              state.notifications[index] =
                updatedNotification;
            }
          }
        )


        // ======================
        // MARK ALL AS READ
        // ======================

        .addCase(
          markAllAsRead.fulfilled,
          (state) => {
            state.notifications =
              state.notifications.map(
                (notification) => ({
                  ...notification,
                  isRead: true,
                })
              );
          }
        )


        // ======================
        // DELETE
        // ======================

        .addCase(
          removeNotification.fulfilled,
          (state, action) => {
            state.notifications =
              state.notifications.filter(
                (notification) =>
                  notification._id !==
                  action.payload
              );
          }
        );
    },
  });


export const {
  addNotification,
 
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;