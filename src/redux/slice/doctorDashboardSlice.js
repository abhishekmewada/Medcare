import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getDoctorDashboardApi,
} from "../../api/doctorDashboard.api";

export const fetchDoctorDashboard =
  createAsyncThunk(
    "doctorDashboard/fetch",
    async (_, { rejectWithValue }) => {
      try {
        const data =
          await getDoctorDashboardApi();

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch doctor dashboard"
        );
      }
    }
  );

const initialState = {
  stats: {
    totalAppointments: 0,
    completedVisits: 0,
    totalRevenue: 0,
    todayUpcomingAppointments: 0,
    patientsUnderCare: 0,
    completionRate: 0,
  },

  upcomingAppointments: [],

  loading: false,
  error: null,
};

const doctorDashboardSlice = createSlice({
  name: "doctorDashboard",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchDoctorDashboard.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDoctorDashboard.fulfilled,
        (state, action) => {
          state.loading = false;

          state.stats =
            action.payload.stats;

          state.upcomingAppointments =
            action.payload.upcomingAppointments;
        }
      )

      .addCase(
        fetchDoctorDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      );
  },
});

export default doctorDashboardSlice.reducer;