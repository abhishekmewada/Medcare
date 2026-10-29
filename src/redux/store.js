import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import uiReducer from "./slice/uiSlice"
import prescriptionReducer  from "./slice/prescriptionSlice";
import appointmentReducer from "./slice/appointmentSlice";
import medicalRecordReducer from "./slice/medicalRecordSlice";
import userReducer from "./slice/userSlice"
import doctorReducer from "./slice/doctorSlice"
import availabilityReducer from "./slice/availabilitySlice"
import notificationReducer from "./slice/notificationSlice"
import doctorDashboardReducer from "./slice/doctorDashboardSlice"
import chatReducer from "./slice/chatSlice";
import adminReducer from "./slice/adminSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointment: appointmentReducer,
    prescriptions: prescriptionReducer,
    medicalRecords: medicalRecordReducer,
    user: userReducer,
    doctors: doctorReducer,
    ui: uiReducer,
    availability: availabilityReducer,
    notification: notificationReducer,
    
    doctorDashboard: doctorDashboardReducer,

    chat: chatReducer,
    admin: adminReducer,
  },
});