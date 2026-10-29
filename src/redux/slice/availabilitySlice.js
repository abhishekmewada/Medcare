import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  saveWeeklyAvailabilityApi,
  getDoctorAvailabilityApi,
} from "../../api/availability.api";

const initialState = {
  availability: [],
  loading: false,
  error: null,
};

// ==============================
// GET DOCTOR AVAILABILITY
// ==============================

export const fetchDoctorAvailability =
  createAsyncThunk(
    "availability/fetchDoctorAvailability",
    async (doctorId, { rejectWithValue }) => {
      try {
        const data =
          await getDoctorAvailabilityApi(
            doctorId
          );

        return data.availability;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch availability"
        );
      }
    }
  );

// ==============================
// SAVE WEEKLY AVAILABILITY
// ==============================

export const saveWeeklyAvailability =
  createAsyncThunk(
    "availability/saveWeeklyAvailability",
    async (availabilityData, { rejectWithValue }) => {
      try {
        const data =
          await saveWeeklyAvailabilityApi(
            availabilityData
          );

        return data.availability;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to save availability"
        );
      }
    }
  );

// ==============================
// SLICE
// ==============================

const availabilitySlice = createSlice({
  name: "availability",

  initialState,

  reducers: {
    clearAvailability: (state) => {
      state.availability = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // GET

      .addCase(
        fetchDoctorAvailability.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDoctorAvailability.fulfilled,
        (state, action) => {
          state.loading = false;
          state.availability =
            action.payload;
        }
      )

      .addCase(
        fetchDoctorAvailability.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // SAVE

      .addCase(
        saveWeeklyAvailability.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        saveWeeklyAvailability.fulfilled,
        (state, action) => {
          state.loading = false;
          state.availability =
            action.payload;
        }
      )

      .addCase(
        saveWeeklyAvailability.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  clearAvailability,
} = availabilitySlice.actions;

export default availabilitySlice.reducer;