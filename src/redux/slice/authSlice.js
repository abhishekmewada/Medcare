import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(
        // STORAGE_KEY,
        JSON.stringify({ token: state.token, doctor: state.doctor })
      );
    },

    setAuthLoading: ( state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, logout, setAuthLoading, updateProfile } = authSlice.actions;

export default authSlice.reducer;