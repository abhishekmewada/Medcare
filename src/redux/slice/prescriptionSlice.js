import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyPrescriptionsApi,
  getDoctorPrescriptionsApi,
  createPrescriptionApi,
  requestPrescriptionRefillApi,
} from "../../api/prescription.api";

export const fetchMyPrescriptions = createAsyncThunk(
  "prescriptions/fetchMyPrescriptions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getMyPrescriptionsApi(params);
      return {
        prescriptions: data.prescriptions || [],
        page: params.page || 1,
        total: data.total ?? data.prescriptions?.length ?? 0,
        hasMore: data.hasMore ?? false,
        counts: data.counts || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load prescriptions"
      );
    }
  }
);

export const fetchDoctorPrescriptions = createAsyncThunk(
  "prescriptions/fetchDoctorPrescriptions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDoctorPrescriptionsApi();
      return data.prescriptions || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load doctor prescriptions"
      );
    }
  }
);

export const issuePrescription = createAsyncThunk(
  "prescriptions/issuePrescription",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createPrescriptionApi(payload);
      return data.prescription;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create prescription"
      );
    }
  }
);

export const requestRefill = createAsyncThunk(
  "prescriptions/requestRefill",
  async (prescriptionId, { rejectWithValue }) => {
    try {
      const data = await requestPrescriptionRefillApi(prescriptionId);
      return data.prescription;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Refill request failed"
      );
    }
  }
);

const initialState = {
  prescriptions: [],
  doctorPrescriptions: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  total: 0,
  counts: null,
};

const prescriptionSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearPrescriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Patient Prescriptions
      .addCase(fetchMyPrescriptions.pending, (state, action) => {
        const isFirstPage = !action.meta?.arg?.page || action.meta.arg.page === 1;
        if (isFirstPage) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchMyPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        const { prescriptions, page, hasMore, total, counts } = action.payload;
        state.hasMore = hasMore;
        state.total = total;
        state.page = page;
        if (counts) {
          state.counts = counts;
        }
        if (page === 1) {
          state.prescriptions = prescriptions;
        } else {
          const existingIds = new Set(
            state.prescriptions.map((p) => p._id || p.id)
          );
          const newItems = prescriptions.filter(
            (p) => !existingIds.has(p._id || p.id)
          );
          state.prescriptions = [...state.prescriptions, ...newItems];
        }
      })
      .addCase(fetchMyPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Doctor Prescriptions
      .addCase(fetchDoctorPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorPrescriptions = action.payload;
      })
      .addCase(fetchDoctorPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Issue Prescription
      .addCase(issuePrescription.fulfilled, (state, action) => {
        state.doctorPrescriptions.unshift(action.payload);
      })
      // Refill
      .addCase(requestRefill.fulfilled, (state, action) => {
        const index = state.prescriptions.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
      });
  },
});

export const { clearPrescriptionError } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;