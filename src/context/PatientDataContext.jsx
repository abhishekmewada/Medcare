import { createContext, useContext, useState } from "react";

const PatientDataContext = createContext(null);

export const PatientDataProvider = ({ children }) => {

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      medicationName: "Amoxicillin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Aman",
      datePrescribed: "10 Aug 2026",
      instructions: "Take after meals with water.",
      refillsRemaining: 2,
      active: true,
    },
    {
      id: 2,
      medicationName: "Paracetamol",
      dosage: "650mg",
      frequency: "As needed",
      prescribedBy: "Dr. Sharma",
      datePrescribed: "5 Aug 2026",
      instructions: "Take when fever or pain occurs.",
      refillsRemaining: 3,
      active: true,
    },
  ]);

  const requestRefill = (id) => {
    setPrescriptions((prev) =>
      prev.map((prescription) =>
        prescription.id === id
          ? {
              ...prescription,
              refillsRemaining:
                prescription.refillsRemaining > 0
                  ? prescription.refillsRemaining - 1
                  : 0,
            }
          : prescription
      )
    );
  };

  return (
    <PatientDataContext.Provider
      value={{
        prescriptions,
        requestRefill,
      }}
    >
      {children}
    </PatientDataContext.Provider>
  );
};

export const usePatientData = () => {
  const context = useContext(PatientDataContext);

  if (!context) {
    throw new Error(
      "usePatientData must be used inside PatientDataProvider"
    );
  }

  return context;
};