import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  FileEdit,
  UserRound,
  Stethoscope,
  Pill,
  Save, 
} from "lucide-react";
import { issuePrescription } from "../../redux/slice/prescriptionSlice";
import { fetchDoctorAppointments } from "../../redux/slice/appointmentSlice";
import { showToast } from "../../redux/slice/uiSlice";

const emptyMed = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
});

const DoctorWritePrescription = ({isOpen, onClose}) => {
   const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { appointments = [] } = useSelector((state) => state.appointment);

  const preselectedPatient = searchParams.get("patient") || "";
  const [patientId, setPatientId] = useState(preselectedPatient);
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState([emptyMed()]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  // Extract unique patient list from scheduled appointments
  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      const p = apt.patient;
      if (p?._id && !map.has(p._id)) {
        map.set(p._id, {
          _id: p._id,
          name: p.fullName || p.name || "Patient",
        });
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  const updateMed = (index, field, value) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addMedRow = () => setMedications((prev) => [...prev, emptyMed()]);

  const removeMedRow = (index) => {
    if (medications.length === 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!patientId) errs.patientId = "Please select a patient.";
    if (!diagnosis.trim()) errs.diagnosis = "Clinical diagnosis is required.";
    const validMeds = medications.filter((m) => m.name.trim());
    if (validMeds.length === 0)
      errs.medications = "Add at least one medicine with valid dosage.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

 // Extract appointment ID if present from the selected patient
  const selectedApt = appointments.find(
    (apt) => String(apt.patient?._id) === String(patientId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
 
      const validMeds = medications
  .filter((m) => m.name && m.name.trim())
  .map((m) => ({
    name: m.name.trim(),
    medicineName: m.name.trim(),
    dosage: m.dosage.trim() || "500mg",
    frequency: m.frequency.trim() || "Twice daily",
    duration: m.duration.trim() || "5 days",
  }));

      const payload = {
  patient: patientId,
  appointment: selectedApt?._id || undefined,
  consultation: selectedApt?.consultation || undefined,
  diagnosis: diagnosis.trim(),
  medicines: validMeds,
  medications: validMeds,
  instructions: notes.trim(),
};

      const result = await dispatch(issuePrescription(payload));
      if (!result.error) {
        dispatch(
          showToast({
            type: "success",
            message: "Prescription successfully issued.",
          })
        );
        navigate("/doctor/prescriptions");
      }
    } finally {
      setSubmitting(false);
    }
  };

    if (!isOpen) return null;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-200/50 bg-teal-50 text-teal-700">
          <FileEdit size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Write Electronic Prescription
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue certified medication regimens and clinical instructions
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Patient Select */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <UserRound size={14} className="text-teal-600" />
              Patient
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select attending patient...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.patientId}</p>
            )}
          </div>

          {/* Diagnosis */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Stethoscope size={14} className="text-teal-600" />
              Diagnosis
            </label>
            <input
              type="text"
              placeholder="e.g. Acute Bronchitis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.diagnosis && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.diagnosis}</p>
            )}
          </div>
        </div>

        {/* Medication Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Pill size={14} className="text-teal-600" />
              Medications & Dosage Instructions
            </label>
            <button
              type="button"
              onClick={addMedRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          <div className="space-y-2.5  ">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1  items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={(e) => updateMed(idx, "name", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={med.dosage}
                  onChange={(e) => updateMed(idx, "dosage", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Frequency (BID)"
                  value={med.frequency}
                  onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Duration (5 days)"
                  value={med.duration}
                  onChange={(e) => updateMed(idx, "duration", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  disabled={medications.length === 1}
                  onClick={() => removeMedRow(idx)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          {errors.medications && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.medications}</p>
          )}
        </div>

        {/* Clinical Instructions */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
            Physician Advice & Patient Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Dietary changes, precautions, warning signs..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-700 disabled:opacity-50"
          >
            <Save size={15} />
            <span>{submitting ? "Signing & Issuing..." : "Issue Prescription"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorWritePrescription;