import { Outlet } from "react-router-dom";

import PatientSidebar from "../components/patient/PatientSidebar";
// import PatientHeader from "../components/patient/PatientHeader";
import { PatientUIProvider } from "../context/PatientUIContext";
import { AppointmentProvider } from "../context/AppointmentContext";
import { MedicalRecordsProvider } from "../context/MedicalRecordsContext";
import { PatientDataProvider } from "../context/PatientDataContext";
import AppointmentModal from "../components/patient/AppointmentModal";
import { SymptomCheckerProvider } from "../context/SymptomCheckerContext";
import ChatBot from "../components/patient/ChatBot";
 
  
const PatientLayout = () => {
  return (
    <PatientUIProvider> 
      <AppointmentProvider> 
        <MedicalRecordsProvider> 
          <PatientDataProvider> 
            <SymptomCheckerProvider> 
           <div className="min-h-screen">

      {/* Sidebar */}
      <PatientSidebar />

      {/* Main area   */}
      <div className="w-full  bg-[#F7F8F5] ">
        <div className=" mx-auto w-full max-w-[1920px] space-y-8 px-4 sm:px-8 md:px-14 lg:px-20" > 
        

        {/* Header */}
        {/* <PatientHeader /> */}

        {/* Current page */}
        <main className="p-1 pt-32  mx-1 md:mx-5 lg:mx-5   ">
          <Outlet />
         </main>
 </div>
      </div>

{/* global  */}
       <AppointmentModal />

{/* floating chat wedgit */}
       <ChatBot />

    </div>
    </SymptomCheckerProvider>
     </PatientDataProvider>
    </MedicalRecordsProvider>
    </AppointmentProvider>
    </PatientUIProvider>

  );
};

export default PatientLayout;