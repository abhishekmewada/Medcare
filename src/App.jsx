 
// import './App.css'

import { Route, Routes } from "react-router-dom"
 import PublicLayout from "./layouts/PublicLayout"
 import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import Home from "./pages/public/Home"
import PatientLayout from "./layouts/PatientLayout"
// import PatientDashboard from "./pages/patient/OverviewView"
import Appointments from "./pages/patient/Appointments"
// import Doctors from "./pages/patient/BookVisitView"
import Prescriptions from "./pages/patient/Prescriptions"
import MedicalRecords from "./pages/patient/MedicalRecords"
// import Messages from "./pages/patient/AiAssistant"
import Profile from "./pages/patient/Profile"
import OverviewView from "./pages/patient/OverviewView"
import BookVisitView from "./pages/patient/BookVisitView"
import AiAssistant from "./pages/patient/AiAssistant"
import SymptomCheckerView from "./pages/patient/SymptomChecker"
import ProtectedRoute from "./pages/auth/ProtectedRoute"
// import AppointmentModal from "./components/patient/AppointmentModal"
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorOverview from "./pages/doctor/DoctorOverview"
import DoctorSchedule from "./pages/doctor/DoctorSchedule"
import DoctorPatients from "./pages/doctor/DoctorPatients"
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions"
import DoctorAnalytics from "./pages/doctor/DoctorAnalytics"
import DoctorProfile from "./pages/doctor/DoctorProfile"
import DoctorWritePrescription from "./pages/doctor/DoctorWritePrescription"
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorManagement from "./pages/admin/DoctorManagement";
import PatientManagement from "./pages/admin/PatientManagement";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminChat from "./pages/admin/AdminChat";
import {useEffect} from "react";
import AOS from "aos";
import "aos/dist/aos.css";
function App() {

  useEffect(() => {
  AOS.init({
    duration: 800,
    once: false,
    offset: 100,
  });
}, []);
 
 
  return (
    <Routes>
      
      {/* ------------------PUBLIC WEB */}
      <Route element={ <PublicLayout/> }>
      <Route path="/" element={ <Home />}  />
      </Route>
      
      {/* ------------------AUTH */}
      <Route path="/login" element={ <Login />} />
       <Route path="/register" element={ <Register />} />

        {/* Protected Route of patient page */}

        <Route element={ <ProtectedRoute allowedRoles={["patient"]} /> }>
         
       {/* ----------------DASHBOARD */}
       <Route  path="/patient" element={<PatientLayout />} >

       <Route index element={<OverviewView />} />
        <Route
          path="appointments"
          element={<Appointments />}
        />

        {/* <Route
    path="appointments/:id"
    element={<AppointmentModal />}
  /> */}

        <Route
          path="doctors"
          element={<BookVisitView />}
        />

        <Route
          path="prescriptions"
          element={<Prescriptions/>}
        />

        <Route
          path="medical-records"
          element={<MedicalRecords/>}
        />

        <Route
          path="messages"
          element={<AiAssistant />}
        />

        <Route
          path="symptoms"
          element={ <SymptomCheckerView />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />
       </Route>

       {/* <Route path="/doctor" element={doctor} /> */}

    </Route>

{/* Protected route of Doctor page */}
<Route element={ <ProtectedRoute allowedRoles={["doctor"]} /> }>
  <Route path="/doctor" element={<DoctorLayout />}>

    <Route
      index
      element={<DoctorOverview />}
    />

    <Route
      path="schedule"
      element={<DoctorSchedule />}
    />

    <Route
      path="patients"
      element={<DoctorPatients />}
    />

    <Route
  path="prescriptions/new"
  element={<DoctorWritePrescription />}
/>

    <Route
      path="prescriptions"
      element={<DoctorPrescriptions />}
    />

    <Route
      path="analytics"
      element={<DoctorAnalytics />}
    />

    <Route
      path="profile"
      element={<DoctorProfile />}
    />

  </Route>
</Route>

{/* Protected route of Admin page */}
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="doctors" element={<DoctorManagement />} />
    <Route path="patients" element={<PatientManagement />} />
    <Route path="appointments" element={<AppointmentManagement />} />
    <Route path="analytics" element={<AnalyticsDashboard />} />
    <Route path="audit-logs" element={<AuditLogs />} />
    <Route path="chat" element={<AdminChat />} />
  </Route>
</Route>


    </Routes>
    
  )
}

export default App
