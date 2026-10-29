import { createContext, useContext, useState } from "react";

const PatientUIContext = createContext(null);

export const PatientUIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Appointment modal
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Open sidebar
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

    // Appointment Modal
  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <PatientUIContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,

         isAppointmentModalOpen,
        selectedAppointment,
        openAppointmentModal,
        closeAppointmentModal,
      }}
    >
      {children}
    </PatientUIContext.Provider>
  );
};

// Custom hook
export const usePatientUI = () => {
  const context = useContext(PatientUIContext);

  if (!context) {
    throw new Error(
      "usePatientUI must be used inside PatientUIProvider"
    );
  }

  return context;
};