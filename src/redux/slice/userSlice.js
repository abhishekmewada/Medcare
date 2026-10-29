import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getProfile,
  updateProfile,
} from "../../api/users.api";
// import { setUser } from "./authSlice";
// import { useDispatch } from "react-redux";

// GET PROFILE
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfile();

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch profile"
      );
    }
  }
);


// UPDATE PROFILE
export const updateUserProfile = createAsyncThunk(

  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await updateProfile(formData);
    //  dispatch(setUser(data.user))
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  }
);


const initialState = {
  profile: null,
  loading: false,
  error: null,
};


const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH PROFILE
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // UPDATE PROFILE
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;

export default userSlice.reducer;