import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDoctorsApi } from "../../api/doctor.api";

// ================= FETCH DOCTORS =================

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchDoctors",

  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getDoctorsApi(params);

      return {
        doctors: data.doctors || [],
        page: params.page || 1,
        total: data.total ?? data.doctors?.length ?? 0,
        hasMore: data.hasMore ?? false,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch doctors"
      );
    }
  }
);

// ================= INITIAL STATE =================

const initialState = {
  doctors: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  total: 0,
};

// ================= SLICE =================

const doctorSlice = createSlice({
  name: "doctors",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH PENDING
      .addCase(fetchDoctors.pending, (state, action) => {
        const isFirstPage = !action.meta?.arg?.page || action.meta.arg.page === 1;
        if (isFirstPage) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })

      // FETCH SUCCESS
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        const { doctors, page, hasMore, total } = action.payload;
        state.hasMore = hasMore;
        state.total = total;
        state.page = page;
        if (page === 1) {
          state.doctors = doctors;
        } else {
          const existingIds = new Set(
            state.doctors.map((d) => d._id || d.id)
          );
          const newItems = doctors.filter(
            (d) => !existingIds.has(d._id || d.id)
          );
          state.doctors = [...state.doctors, ...newItems];
        }
      })

      // FETCH ERROR
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export default doctorSlice.reducer;