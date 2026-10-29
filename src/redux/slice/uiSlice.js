import { createSlice } from '@reduxjs/toolkit';

const THEME_KEY = 'medcare_doctor_theme';

const initialState = {
  darkMode: localStorage.getItem(THEME_KEY) === 'dark',
  sidebarOpen: false, // for mobile drawer
  toast: null, // { message, type }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem(THEME_KEY, state.darkMode ? 'dark' : 'light');
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const { toggleDarkMode, setSidebarOpen, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
