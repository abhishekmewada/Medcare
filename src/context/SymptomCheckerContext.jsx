import {
  createContext,
  useContext,
  useState,
} from "react";

const SymptomCheckerContext = createContext(null);

export const SymptomCheckerProvider = ({ children }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("Mild");
  const [analyzed, setAnalyzed] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) {
      return;
    }

    setAnalyzed(true);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setDuration("1-3 days");
    setSeverity("Mild");
    setAnalyzed(false);
  };

  return (
    <SymptomCheckerContext.Provider
      value={{
        selectedSymptoms,
        duration,
        severity,
        analyzed,

        toggleSymptom,
        setDuration,
        setSeverity,
        handleAnalyze,
        handleReset,
      }}
    >
      {children}
    </SymptomCheckerContext.Provider>
  );
};

export const useSymptomChecker = () => {
  const context = useContext(SymptomCheckerContext);

  if (!context) {
    throw new Error(
      "useSymptomChecker must be used inside SymptomCheckerProvider"
    );
  }

  return context;
};