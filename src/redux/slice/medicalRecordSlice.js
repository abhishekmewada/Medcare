import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyMedicalRecordsApi,
  uploadMedicalRecordApi,
  deleteMedicalRecordApi,
} from "../../api/medicalRecord.api";

 
export const fetchMedicalRecords = createAsyncThunk(
  "medicalRecords/fetchMedicalRecords",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyMedicalRecordsApi();
      return data.records || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch medical records"
      );
    }
  }
);

export const uploadMedicalRecord = createAsyncThunk(
  "medicalRecords/uploadMedicalRecord",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await uploadMedicalRecordApi(formData);
      return data.record;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload medical record"
      );
    }
  }
);

export const removeMedicalRecord = createAsyncThunk(
  "medicalRecords/removeMedicalRecord",
  async (id, { rejectWithValue }) => {
    try {
      await deleteMedicalRecordApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete medical record"
      );
    }
  }
);

const initialState = {
  records: [],
  loading: false,
  error: null,
};

const medicalRecordSlice = createSlice({
  name: "medicalRecords",
  initialState,
  reducers: {
    clearRecordError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload
      .addCase(uploadMedicalRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      // Delete
      .addCase(removeMedicalRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((rec) => rec._id !== action.payload);
      });
  },
});

export const { clearRecordError } = medicalRecordSlice.actions;
export default medicalRecordSlice.reducer;