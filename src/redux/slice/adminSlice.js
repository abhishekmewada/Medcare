import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getDashboardApi,
  getAllUsersApi,
  getAllDoctorsApi,
  getAllPatientsApi,
  getAllAppointmentsApi,
  getAnalyticsApi,
  getAuditLogsApi,
  approveDoctorApi,
  rejectDoctorApi,
  updateDoctorStatusApi,
  toggleUserBlockApi,
  deleteUserApi,
  getAdminConversationsApi,
} from "../../api/admin.api";

// ==========================================
// THUNKS
// ==========================================

export const fetchDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDashboardApi();
      return data.dashboard;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard"
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllUsersApi();
      return data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchAllDoctors = createAsyncThunk(
  "admin/fetchAllDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllDoctorsApi();
      return data.doctors;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch doctors"
      );
    }
  }
);

export const fetchAllPatients = createAsyncThunk(
  "admin/fetchAllPatients",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllPatientsApi();
      return data.patients;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch patients"
      );
    }
  }
);

export const fetchAllAppointments = createAsyncThunk(
  "admin/fetchAllAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllAppointmentsApi();
      return data.appointments;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAnalyticsApi();
      return data.analytics;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  "admin/fetchAuditLogs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAuditLogsApi();
      return data.logs;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit logs"
      );
    }
  }
);

export const approveDoctor = createAsyncThunk(
  "admin/approveDoctor",
  async (id, { rejectWithValue }) => {
    try {
      const data = await approveDoctorApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve doctor"
      );
    }
  }
);

export const rejectDoctor = createAsyncThunk(
  "admin/rejectDoctor",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await rejectDoctorApi(id, { reason });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject doctor"
      );
    }
  }
);

export const updateDoctorStatus = createAsyncThunk(
  "admin/updateDoctorStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await updateDoctorStatusApi(id, { status });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update doctor status"
      );
    }
  }
);

export const toggleUserBlock = createAsyncThunk(
  "admin/toggleUserBlock",
  async (id, { rejectWithValue }) => {
    try {
      const data = await toggleUserBlockApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle user block"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteUserApi(id);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

export const fetchAdminConversations = createAsyncThunk(
  "admin/fetchAdminConversations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminConversationsApi();
      return data.conversations;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  dashboard: null,
  users: [],
  doctors: [],
  patients: [],
  appointments: [],
  analytics: null,
  auditLogs: [],
  conversations: [],

  loading: false,
  dashboardLoading: false,
  doctorsLoading: false,
  patientsLoading: false,
  appointmentsLoading: false,
  analyticsLoading: false,
  auditLogsLoading: false,
  conversationsLoading: false,

  error: null,
  actionLoading: false,
  actionError: null,
};

// ==========================================
// SLICE
// ==========================================

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    // DASHBOARD
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      });

    // USERS
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DOCTORS
    builder
      .addCase(fetchAllDoctors.pending, (state) => {
        state.doctorsLoading = true;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.error = action.payload;
      });

    // PATIENTS
    builder
      .addCase(fetchAllPatients.pending, (state) => {
        state.patientsLoading = true;
      })
      .addCase(fetchAllPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = action.payload;
      })
      .addCase(fetchAllPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.error = action.payload;
      });

    // APPOINTMENTS
    builder
      .addCase(fetchAllAppointments.pending, (state) => {
        state.appointmentsLoading = true;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.error = action.payload;
      });

    // ANALYTICS
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // AUDIT LOGS
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditLogsLoading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogsLoading = false;
        state.auditLogs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLogsLoading = false;
        state.error = action.payload;
      });

    // APPROVE DOCTOR
    builder
      .addCase(approveDoctor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveDoctor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const doc = action.payload?.doctor;
        if (doc) {
          const idx = state.doctors.findIndex(
            (d) => d._id === doc._id
          );
          if (idx !== -1) {
            state.doctors[idx] = { ...state.doctors[idx], ...doc, isApproved: true };
          }
        }
      })
      .addCase(approveDoctor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // REJECT DOCTOR
    builder
      .addCase(rejectDoctor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rejectDoctor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const doc = action.payload?.doctor;
        if (doc) {
          const idx = state.doctors.findIndex(
            (d) => d._id === doc._id
          );
          if (idx !== -1) {
            state.doctors[idx] = { ...state.doctors[idx], ...doc, isApproved: false };
          }
        }
      })
      .addCase(rejectDoctor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // TOGGLE BLOCK
    builder
      .addCase(toggleUserBlock.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload?.user;
        if (updated) {
          // Update in doctors
          const dIdx = state.doctors.findIndex((d) => d._id === updated._id);
          if (dIdx !== -1) state.doctors[dIdx] = { ...state.doctors[dIdx], ...updated };
          // Update in patients
          const pIdx = state.patients.findIndex((p) => p._id === updated._id);
          if (pIdx !== -1) state.patients[pIdx] = { ...state.patients[pIdx], ...updated };
          // Update in users
          const uIdx = state.users.findIndex((u) => u._id === updated._id);
          if (uIdx !== -1) state.users[uIdx] = { ...state.users[uIdx], ...updated };
        }
      })
      .addCase(toggleUserBlock.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // DELETE USER
    builder
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedId = action.payload?.id;
        if (deletedId) {
          state.users = state.users.filter((u) => u._id !== deletedId);
          state.doctors = state.doctors.filter((d) => d._id !== deletedId);
          state.patients = state.patients.filter((p) => p._id !== deletedId);
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // CONVERSATIONS
    builder
      .addCase(fetchAdminConversations.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(fetchAdminConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchAdminConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
