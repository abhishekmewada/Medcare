import { createContext, useContext, useState } from "react";

// import {
//   mockMedicalRecords,
// } from "../data/mockData";

const MedicalRecordsContext = createContext(null);

export const MedicalRecordsProvider = ({ children }) => {
  const [records, setRecords] = useState(
    []
  );

  const addRecord = (record) => {
    setRecords((prev) => [
      record,
      ...prev,
    ]);
  };

  const removeRecord = (id) => {
    setRecords((prev) =>
      prev.filter(
        (record) => record.id !== id
      )
    );
  };

  return (
    <MedicalRecordsContext.Provider
      value={{
        records,
        addRecord,
        removeRecord,
      }}
    >
      {children}
    </MedicalRecordsContext.Provider>
  );
};

export const useMedicalRecords = () => {
  const context = useContext(
    MedicalRecordsContext
  );

  if (!context) {
    throw new Error(
      "useMedicalRecords must be used inside MedicalRecordsProvider"
    );
  }

  return context;
};