import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DoctorWritePrescription from "../../pages/doctor/DoctorWritePrescription";
 import AOS from "aos";
import {
  ClipboardList,
  Search,
  Plus,
  Calendar,
  Pill,
  Activity,
  FileText,
  Stethoscope,
  ArrowUpRight,
  Eye,
  Printer,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";

import EmptyState from "../../components/ui/EmptyState";
import { fetchDoctorPrescriptions } from "../../redux/slice/prescriptionSlice";

// Helper to resolve backend image URLs
const resolveAvatarUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  // Use backend URL from environment variable (remove trailing /api if present)
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/,'' );
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const DoctorPrescriptions = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { doctorPrescriptions = [], loading } = useSelector(
    (state) => state.prescriptions
  );

  const [query, setQuery] = useState("");
  const [selectedRx, setSelectedRx] = useState(null);
  const [prescriptionModal, setPrescriptionModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorPrescriptions());
    AOS.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 60 });
  }, [dispatch]);

  const doctorName = user?.fullName || user?.name || "Doctor";
  const specialty = user?.specialty || "Clinical Practitioner";

  // Filter prescriptions by patient name or diagnosis
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctorPrescriptions;
    return doctorPrescriptions.filter((rx) => {
      const patient = rx.patient?.fullName || rx.patientName || "";
      const diagnosis = rx.diagnosis || "";
      return (
        patient.toLowerCase().includes(q) || diagnosis.toLowerCase().includes(q)
      );
    });
  }, [doctorPrescriptions, query]);

  // Calculated practice metrics
  const totalPrescriptions = doctorPrescriptions.length;
  const totalMeds = useMemo(() => {
    return doctorPrescriptions.reduce(
      (acc, rx) => acc + (rx.medications?.length || 0),
      0
    );
  }, [doctorPrescriptions]);

  const uniquePatients = useMemo(() => {
    const set = new Set(
      doctorPrescriptions.map(
        (rx) => rx.patient?._id || rx.patient || rx.patientName || rx._id
      )
    );
    return set.size;
  }, [doctorPrescriptions]);

  const activeRegimens = doctorPrescriptions.length;
  // const validationRate = 100;

  const handlePrintModal = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen  text-slate-800 py-32 font-sans antialiased">

 <div className="pointer-events-none  -top-24 left-1/4 fixed h-196 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-20 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="mx-auto w-full max-w-[1920px] space-y-6 px-4 md:px-14 lg:px-24">
        
        {/* ========================================================= */}
        {/* 1. HEADER (CareSync / DoctorOverview Style)               */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-stone-200/70">
          <div className="space-y-3">
            <div
              data-aos="fade-right"
              data-aos-delay="0"
              data-aos-duration="700"
              className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-xs"
            >
              <Stethoscope className="h-3.5 w-3.5 text-[#77af9c]" />
              <span>Physician Portal</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Pharmacotherapy Ledger</span>
            </div>

            <h1
              data-aos="fade-right"
              data-aos-delay="150"
              data-aos-duration="700"
              className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-tight"
            >
              Manage digital{" "}
              <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900">
                prescriptions
              </span>{" "}
              &amp;{" "}
              <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
                medications.
              </span>
            </h1>

            <p
              data-aos="fade-right"
              data-aos-delay="300"
              data-aos-duration="700"
              className="text-xs sm:text-sm text-stone-600 max-w-xl"
            >
              Welcome back, <strong className="text-slate-800">Dr. {doctorName}</strong> ({specialty}). You have authored{" "}
              <strong className="text-[#285943]">{totalPrescriptions} digital prescriptions</strong> in your clinical ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
            type="button"
         className="inline-flex items-center gap-2.5 rounded-full border border-[#8cd790]/60 bg-white px-5 py-2.5 text-xs font-semibold text-[#285943] transition shadow-2xs hover:bg-[#DDF4EC]/40"
            onClick={() => setPrescriptionModal(true)}
             > 
              <Plus className="h-3.5 w-3.5 text-[#285943]" strokeWidth={2.5} />
              <span>Write New Rx</span>
               <ArrowUpRight className=" bg-[#FA6432] text-white rounded-full h-5 w-5" />
            </button>
           

            
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CLINICAL TOPICS & PICTURES ON TOP (CareSync Style)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          
          {/* Photo Tile: Pharmacotherapy Station */}
          {/* <div className="lg:col-span-5 relative overflow-hidden rounded-[28px] border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between min-h-55">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800"
                alt="Pharmacotherapy Desk"
                className="h-full w-full object-cover object-[center_30%] opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full border border-[#77af9c]/40 bg-white/90 px-3 py-0.5 text-[10px] font-bold uppercase text-[#285943]">
                e-prescription desk ⓘ
              </span>
              <span className="rounded-full bg-[#FA6432] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                Active Ledger
              </span>
            </div>

            <div className="relative z-10 my-4 max-w-sm">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Clinical Pharmacotherapy &amp; Regimens
              </h3>
              <p className="mt-1 text-xs text-stone-600">
                Digital prescriptions synchronized with electronic patient health records, validated dosages, and instructions.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <span className="rounded-full bg-stone-900 text-white px-3 py-1 text-[10px] font-semibold">Standardized</span>
              <span className="rounded-full bg-white border border-stone-200 px-3 py-1 text-[10px] font-semibold text-stone-600">Drug-Drug Screened</span>
              <Link to="/doctor/prescriptions/new" className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#285943] hover:underline">
                <span>Author Rx</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div> */}

          {/* Clinical Update Topic: Drug Interaction & Allergy Triage */}
          {/* <div className="lg:col-span-4 rounded-[28px] border border-[#77af9c]/40 bg-[#E8F4F0]/70 p-6 shadow-xs flex flex-col justify-between min-h-55">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[#77af9c]/30 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#285943]">
                  pharmacovigilance • safety alert
                </span>
                <HeartPulse className="h-4 w-4 text-[#77af9c]" />
              </div>

              <div className="mt-4 space-y-1.5">
                <h4 className="text-base font-bold text-slate-900">
                  Drug Interactions &amp; Allergy Triage
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Cross-examine previous adverse reactions, renal parameters, and concurrent medications before issuing broad-spectrum therapy.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#77af9c]/20 flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#285943]">Evidence-Based Authoring</span>
              <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-[#285943] shadow-2xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div> */}

          {/* Performance Ring: Validation Accuracy */}
          {/* <div className="lg:col-span-3 rounded-[28px] border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between min-h-55">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                validation ⓘ
              </span>
              <Activity className="h-4 w-4 text-[#77af9c]" />
            </div>

            <div className="my-2 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-24 w-24">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#285943]"
                    strokeDasharray={`${validationRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-900">{validationRate}%</span>
                  <span className="text-[8px] text-stone-400 uppercase font-semibold">accuracy</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-2 text-center">
              <p className="text-xs font-semibold text-slate-800">{totalPrescriptions} Authored Records</p>
              <p className="text-[10px] text-stone-400">Zero transcription discrepancies</p>
            </div>
          </div> */}

        </div>

        {/* ========================================================= */}
        {/* 3. STAT METRICS BENTO (4 Bento Cards from DoctorOverview) */}
        {/* ========================================================= */}
        <div
          data-aos="fade-up"
          data-aos-delay="0"
          data-aos-duration="700"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-[22px] border border-stone-200/80 bg-[#E8F3F5] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Total Prescriptions</span>
              <div className="h-8 w-8 rounded-xl bg-[#E8F4F0] text-[#285943] flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-light text-slate-900">{totalPrescriptions}</span>
              <p className="text-[11px] text-[#77af9c] mt-0.5">Authoring volume</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-stone-200/80 bg-[#EAF6EE] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Active Regimens</span>
              <div className="h-8 w-8 rounded-xl bg-[#E8F4F0] text-[#285943] flex items-center justify-center">
                <Pill className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-light text-slate-900">{activeRegimens}</span>
              <p className="text-[11px] text-[#77af9c] mt-0.5">Therapeutic regimens</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-stone-200/80 bg-[#EEF0FA] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Patients Treated</span>
              <div className="h-8 w-8 rounded-xl bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-light text-slate-900">{uniquePatients}</span>
              <p className="text-[11px] text-[#77af9c] mt-0.5">Distinct individuals</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-stone-200/80 bg-[#FFF4E5] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Medications Dispensed</span>
              <div className="h-8 w-8 rounded-xl bg-[#FFF1ED] text-[#FA6432] flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-light text-slate-900">{totalMeds}</span>
              <p className="text-[11px] text-[#FA6432] mt-0.5">Prescribed formulations</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SEARCH & FILTER STREAM                                */}
        {/* ========================================================= */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="700"
          className="rounded-[28px] border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient identity or clinical diagnosis..."
              className="w-full rounded-2xl border border-stone-200 bg-[#FAFBF9] py-2.5 pl-11 pr-10 text-xs text-slate-800 placeholder:text-stone-400 outline-none transition focus:border-[#77af9c] focus:bg-white focus:ring-2 focus:ring-[#77af9c]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
            <span className="rounded-full border border-stone-200 bg-[#FAFBF9] px-3.5 py-1.5 text-xs font-semibold text-stone-600">
              Showing <strong className="text-[#285943]">{filtered.length}</strong> of {totalPrescriptions}
            </span>

            <button 
            type="button"
            onClick={() => setPrescriptionModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#285943] hover:bg-[#1e4735] text-white px-4 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Plus size={14} />
              <span>New Prescription</span>

            </button>

             
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. PRESCRIPTION CARDS STREAM                             */}
        {/* ========================================================= */}
        <div>
          {loading ? (
            <div className="rounded-[28px] border border-stone-200/80 bg-white p-16 text-center shadow-xs">
              <div className="mx-auto h-8 w-8 border-3 border-[#285943] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-stone-500 font-medium">
                Retrieving clinical prescription ledger records...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-white p-12 text-center shadow-xs">
              <EmptyState
                icon={ClipboardList}
                title={query ? "No matching prescriptions" : "Prescription ledger is currently empty"}
                description="Authored prescriptions will be recorded and archived chronologically in this view."
              />
              <div className="mt-4">
                <Link
                  to="/doctor/prescriptions/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FA6432] text-white px-5 py-2 text-xs font-bold shadow-sm hover:scale-105 transition"
                >
                  <Plus size={14} />
                  <span>Write First Prescription</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((rx) => {
                const id = rx._id || rx.id;
                const patientName =
                  rx.patient?.fullName || rx.patientName || "Attending Patient";

                const patientPhoto =
                  rx.patient?.avatar ||
                  rx.patient?.photo ||
                  rx.patient?.image ||
                  rx.patient?.profilePicture ||
                  rx.patientPhoto ||
                  null;

                const patientInitials = patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const dateStr = rx.createdAt
                  ? new Date(rx.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : rx.date || "Recent Entry";

                const medCount = rx.medications?.length || 0;

                return (
                  <div
                    key={id}
                    data-aos="fade-up"
                    className="group rounded-[28px] border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#77af9c] transition-all duration-200 hover:shadow-md"
                  >
                    <div className="space-y-4">
                      
                      {/* Patient Row */}
                      <div className="flex items-start gap-3.5 border-b border-stone-100 pb-4">
                        {patientPhoto ? (
                          <img
                            src={resolveAvatarUrl(patientPhoto)}
                            alt={patientName}
                            className="h-11 w-11 rounded-full object-cover border border-stone-200 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={`h-11 w-11 rounded-full bg-[#DDF4EC] text-[#285943] font-bold text-xs items-center justify-center shrink-0 ${
                            patientPhoto ? "hidden" : "flex"
                          }`}
                        >
                          {patientInitials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {patientName}
                            </h3>
                            <span className="text-[10px] font-mono uppercase bg-[#F3F1EC] text-[#5A6056] px-2 py-0.5 rounded-full shrink-0 border border-stone-200/60">
                              RX-{String(id).slice(-4)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#285943] font-medium truncate">
                            <FileText size={12} className="shrink-0 text-[#77af9c]" />
                            <span className="truncate">{rx.diagnosis || "General Clinical Regimen"}</span>
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-400">
                            <Calendar size={11} className="shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Prescribed Medications */}
                      {medCount > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            <span>Prescribed Medications</span>
                            <span className="text-[#285943] font-semibold">{medCount} items</span>
                          </div>

                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                            {rx.medications.map((m, i) => (
                              <div
                                key={i}
                                className="rounded-2xl border border-stone-200/70 bg-[#FAFBF9] p-3 text-xs"
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="font-bold text-slate-800 truncate">
                                    {m.name}
                                  </span>
                                  <span className="text-[10px] font-semibold text-[#285943] bg-[#DDF4EC] px-2 py-0.5 rounded-full shrink-0">
                                    {m.dosage}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-stone-500">
                                  {m.frequency} • {m.duration}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clinical Instructions / Advice */}
                      {rx.instructions && (
                        <div className="rounded-2xl bg-[#FAFBF9] border-l-3 border-[#77af9c] px-3.5 py-2.5 text-xs text-stone-600 leading-relaxed">
                          <span className="font-semibold text-slate-800">Advice: </span>
                          <span className="italic">"{rx.instructions}"</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#285943]">
                        <Pill size={12} className="text-[#77af9c]" /> Active Prescription
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedRx(rx)}
                        className="inline-flex items-center gap-1 rounded-xl bg-stone-50 hover:bg-[#DDF4EC] text-stone-700 hover:text-[#285943] px-3 py-1.5 text-xs font-semibold transition"
                      >
                        <Eye size={13} />
                        <span>View Rx</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 6. BOTTOM CLINICAL CERTIFICATION BADGE                    */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-stone-200/80 bg-white/80 p-5 text-xs text-stone-500 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-[#285943]">
            <ShieldCheck className="h-4 w-4" />
            <span>Digitally Authorized &amp; Audited Medical Records</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            All electronic prescriptions authored through this portal conform to clinical healthcare guidelines and are legally certified for verified dispensing.
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 7. PRESCRIPTION PREVIEW MODAL (DoctorOverview Style)     */}
      {/* ========================================================= */}
      {selectedRx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
          onClick={() => setSelectedRx(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-4xl border border-stone-200/80 bg-[#FAFBF9] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDF4EC] text-[#285943]">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Medical Prescription Record</h3>
                  <p className="text-[10px] font-mono text-stone-400 uppercase">
                    ID: RX-{String(selectedRx._id || selectedRx.id).slice(-6)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Patient & Clinic Meta */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase">Patient Name</span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedRx.patient?.fullName || selectedRx.patientName || "Attending Patient"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase">Issue Date</span>
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedRx.createdAt
                      ? new Date(selectedRx.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent Entry"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400">Clinical Diagnosis:</span>
                  <p className="font-semibold text-[#285943]">
                    {selectedRx.diagnosis || "General Consultation"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400">Authoring Physician:</span>
                  <p className="font-semibold text-slate-800">Dr. {doctorName}</p>
                </div>
              </div>
            </div>

            {/* Prescribed Medications Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">Prescribed Formulations</span>
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white overflow-hidden">
                {(selectedRx.medications || []).map((med, index) => (
                  <div key={index} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{med.name}</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {med.frequency} • {med.duration}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#DDF4EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#285943]">
                      {med.dosage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice & Instructions */}
            {selectedRx.instructions && (
              <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Clinical Advice</span>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "{selectedRx.instructions}"
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrintModal}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 shadow-2xs transition"
              >
                <Printer size={14} />
                <span>Print Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="rounded-2xl bg-[#285943] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1e4735] shadow-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* write Prescription Modal */}
      {prescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
          onClick={() => setPrescriptionModal(false)} >
            <div  onClick={(e) => e.stopPropagation()}
            className=" rounded-4xl border border-stone-200/80 bg-[#FAFBF9] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto" >

           {/* <DoctorWritePrescription setPrescriptionModal={setPrescriptionModal} /> */}
           <DoctorWritePrescription isOpen={prescriptionModal}    
  onClose={() => setPrescriptionModal(false)}       />

            </div>

        </div>
      )

      }

    </div>
    
  );
};

export default DoctorPrescriptions;