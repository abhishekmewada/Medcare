import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AppointmentContext = createContext(null);

export const AppointmentProvider = ({ children }) => {
  const navigate = useNavigate();

  // =========================
  // SELECTED DOCTOR
  // =========================

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // =========================
  // BOOK VISIT MODAL
  // =========================

  const [isBookVisitModalOpen, setIsBookVisitModalOpen] =
    useState(false);

  // =========================
  // APPOINTMENTS
  // =========================

  const [appointments, setAppointments] = useState([]);

  // =========================
  // APPOINTMENT DETAILS MODAL
  // =========================

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    useState(false);

  // =========================
  // BOOK VISIT FROM OVERVIEW
  // =========================

  const openBookVisit = () => {
    navigate("/patient/doctors");
  };

  // =========================
  // SELECT DOCTOR
  // =========================

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookVisitModalOpen(true);
  };

  // =========================
  // CLOSE BOOK VISIT MODAL
  // =========================

  const closeBookVisitModal = () => {
    setIsBookVisitModalOpen(false);
    setSelectedDoctor(null);
  };

  // =========================
  // ADD APPOINTMENT
  // =========================

  const addAppointment = (appointment) => {
    setAppointments((prev) => [
      ...prev,
      appointment,
    ]);
  };

  // =========================
  // SELECT APPOINTMENT
  // =========================

  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // =========================
  // CLOSE APPOINTMENT MODAL
  // =========================

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <AppointmentContext.Provider
      value={{
        // Doctor
        selectedDoctor,
        selectDoctor,

        // Book Visit
        openBookVisit,
        isBookVisitModalOpen,
        closeBookVisitModal,

        // Appointments
        appointments,
        addAppointment,

        // Appointment Modal
        selectedAppointment,
        isAppointmentModalOpen,
        selectAppointment,
        closeAppointmentModal,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);

  if (!context) {
    throw new Error(
      "useAppointment must be used inside AppointmentProvider"
    );
  }

  return context;
};