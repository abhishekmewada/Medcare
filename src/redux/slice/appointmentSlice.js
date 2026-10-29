import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  createAppointmentApi,
  getMyAppointmentsApi,
  getDoctorAppointmentsApi,
  updateAppointmentStatusApi,
  cancelAppointmentApi,
} from "../../api/appointment.api";


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  appointments: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  total: 0,
  counts: null,
};

// ==========================================
// GET MY APPOINTMENTS - PATIENT
// ==========================================

export const fetchMyAppointments = createAsyncThunk(
  "appointment/fetchMyAppointments",

  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getMyAppointmentsApi(params);

      return {
        appointment: data.appointment || [],
        page: params.page || 1,
        total: data.total ?? data.appointment?.length ?? 0,
        hasMore: data.hasMore ?? false,
        counts: data.counts || null,
      };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch appointments"
      );
    }
  }
);


// ==========================================
// CREATE APPOINTMENT
// ==========================================

export const createAppointment = createAsyncThunk(
  "appointment/createAppointment",

  async (appointmentData, { rejectWithValue }) => {
    try {
      const data = await createAppointmentApi(
        appointmentData
      );

      return data.appointment;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create appointment"
      );
    }
  }
);


// ==========================================
// GET DOCTOR APPOINTMENTS
// ==========================================

export const fetchDoctorAppointments = createAsyncThunk(
  "appointment/fetchDoctorAppointments",

  async (_, { rejectWithValue }) => {
    try {
      const data = await getDoctorAppointmentsApi();

      return data.appointments || [];

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch doctor appointments"
      );
    }
  }
);


// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

export const updateAppointmentStatus = createAsyncThunk(
  "appointment/updateStatus",

  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await updateAppointmentStatusApi(
        id,
        status
      );

      return data.appointment;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update appointment"
      );
    }
  }
);


// ==========================================
// CANCEL APPOINTMENT
// ==========================================

export const cancelAppointment = createAsyncThunk(
  "appointment/cancelAppointment",

  async (id, { rejectWithValue }) => {
    try {
      const data = await cancelAppointmentApi(id);

      return data.appointment;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to cancel appointment"
      );
    }
  }
);


// ==========================================
// SLICE
// ==========================================

const appointmentSlice = createSlice({
  name: "appointment",

  initialState,

  reducers: {
    clearAppointments: (state) => {
      state.appointments = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================
      // FETCH MY APPOINTMENTS
      // ======================================

      .addCase(
        fetchMyAppointments.pending,
        (state, action) => {
          const isFirstPage = !action.meta?.arg?.page || action.meta.arg.page === 1;
          if (isFirstPage) {
            state.loading = true;
          } else {
            state.loadingMore = true;
          }
          state.error = null;
        }
      )

      .addCase(
        fetchMyAppointments.fulfilled,
        (state, action) => {
          state.loading = false;
          state.loadingMore = false;
          const { appointment, page, hasMore, total, counts } = action.payload;
          state.hasMore = hasMore;
          state.total = total;
          state.page = page;
          if (counts) {
            state.counts = counts;
          }
          if (page === 1) {
            state.appointments = appointment;
          } else {
            const existingIds = new Set(
              state.appointments.map((a) => a._id || a.id)
            );
            const newItems = appointment.filter(
              (a) => !existingIds.has(a._id || a.id)
            );
            state.appointments = [...state.appointments, ...newItems];
          }
        }
      )

      .addCase(
        fetchMyAppointments.rejected,
        (state, action) => {
          state.loading = false;
          state.loadingMore = false;
          state.error = action.payload;
        }
      )


      // ======================================
      // CREATE APPOINTMENT
      // ======================================

      .addCase(
        createAppointment.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        createAppointment.fulfilled,
        (state, action) => {
          state.loading = false;

          state.appointments.push(
            action.payload
          );
        }
      )

      .addCase(
        createAppointment.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // ======================================
      // DOCTOR APPOINTMENTS
      // ======================================

      .addCase(
        fetchDoctorAppointments.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDoctorAppointments.fulfilled,
        (state, action) => {
          state.loading = false;
          state.appointments = action.payload;
        }
      )

      .addCase(
        fetchDoctorAppointments.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // ======================================
      // UPDATE STATUS
      // ======================================

      .addCase(
        updateAppointmentStatus.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        updateAppointmentStatus.fulfilled,
        (state, action) => {
          state.loading = false;

          const updatedAppointment =
            action.payload;

          const index =
            state.appointments.findIndex(
              (appointment) =>
                appointment._id ===
                updatedAppointment._id
            );

          if (index !== -1) {
            state.appointments[index] =
              updatedAppointment;
          }
        }
      )

      .addCase(
        updateAppointmentStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // ======================================
      // CANCEL APPOINTMENT
      // ======================================

      .addCase(
        cancelAppointment.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        cancelAppointment.fulfilled,
        (state, action) => {
          state.loading = false;

          const cancelledAppointment =
            action.payload;

          const index =
            state.appointments.findIndex(
              (appointment) =>
                appointment._id ===
                cancelledAppointment._id
            );

          if (index !== -1) {
            state.appointments[index] =
              cancelledAppointment;
          }
        }
      )

      .addCase(
        cancelAppointment.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});


// ==========================================
// ACTIONS
// ==========================================

export const {
  clearAppointments,
} = appointmentSlice.actions;


// ==========================================
// REDUCER
// ==========================================

export default appointmentSlice.reducer;