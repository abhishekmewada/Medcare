import {
  
  Pill,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  HeartPulse,
  Video,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UpcomingAppointmentsCard from "../../components/patient/UpcomingAppointmentsCard";
import AiAssistantCard from "../../components/patient/AiAssistantCard";
import { fetchMyAppointments } from "../../redux/slice/appointmentSlice";
import { useMedicalRecords } from "../../context/MedicalRecordsContext";

const OverviewView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { appointments = [], loading } = useSelector((state) => state.appointment);
  const { records = [] } = useMedicalRecords();
  const prescriptions = useSelector((state) => state.prescriptions?.prescriptions || []);

  // UI state for Image 2 style expandable accordion sections
  const [openSection, setOpenSection] = useState("prescriptions");

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  const totalAppointments = appointments.length;
  const upcomingAppointmentsList = appointments.filter((appointment) =>
    ["pending", "confirmed", "upcoming"].includes(appointment.status?.toLowerCase())
  );
  const upcomingAppointments = upcomingAppointmentsList.length;
  const nextAppointment = upcomingAppointmentsList[0] || null;

  const activePrescriptions = prescriptions.filter((p) => p.active !== false);
  const activePrescriptionsCount = activePrescriptions.length;
  const totalRecords = records.length;

  const goToAppointments = () => navigate("/patient/appointments");
  const goToPrescriptions = () => navigate("/patient/prescriptions");
  const goToRecords = () => navigate("/patient/medical-records");
  const goToDoctors = () => navigate("/patient/doctors");
  const goToMessages = () => navigate("/patient/messages");
  const goToSymptomChecker = () => navigate("/patient/symptoms");

  return (
    <div className=" relative min-h-screen   text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8">
            {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 h-150 w-225 rounded-full bg-blue-400/40 blur-[150px] -z-10" /> */}

      {/* ── TOP EDITORIAL HERO (Exact Image 2 Header) ── */}
      <div   className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1 border-b border-stone-200/60 pb-6">
        <div  data-aos="fade-right" className="flex items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar with "+" tag matching Image 2 */}
          <div className="relative group cursor-pointer" onClick={goToDoctors}>
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-dashed border-stone-300 p-0.5 transition-transform group-hover:scale-105">
              <div className="h-full w-full rounded-full bg-[#E8F2EC] flex items-center justify-center font-bold text-[#285943] text-lg sm:text-xl">
                {user?.fullName
                  ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "PT"}
              </div>
            </div>
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#285943] text-white text-[11px] font-bold shadow-xs">
              +
            </span>
            <span className="hidden sm:block text-[11px] text-center font-medium text-stone-500 mt-1">
              Book Appointment
            </span>
          </div>

          {/* Large Headline with CareSync pill outlines */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.2]">
              Take{" "}
              <span className="inline-block rounded-full border border-slate-900/40 px-3.5 sm:px-5 py-0.5 font-normal italic bg-white/70">
                control
              </span>{" "}
              <br className="hidden sm:inline" />
              of your{" "}
              <span className="inline-block rounded-full border border-[#77af9c]/60 bg-[#DDF4EC] px-3.5 sm:px-5 py-0.5 font-medium text-[#285943]">
                health.
              </span>
            </h1>
          </div>
        </div>

        {/* Right Welcome Note & Orange Accent Button */}
        <div  data-aos="fade-left" className="flex items-center gap-4 lg:self-center">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold capitalize text-slate-900">
              Welcome, {user?.fullName || "Patient"}
            </p>
           </div>

          <button
            type="button"
            onClick={goToDoctors}
            className="flex items-center gap-2 rounded-full bg-[#FA6432] hover:bg-[#e45222] text-white px-5 py-3 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>Book Visit</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── BENTO GRID ROW 1: CREATIVE HEALTH METRICS & VIDEO VISIT ── */}
      <div data-aos="fade-up"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Statistics & Well-being Cards (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Tile A: Circular Stat Ring (Exact 82% widget from Image 2) */}
          <div 
            onClick={goToAppointments}
            className="group cursor-pointer rounded-[26px] border border-stone-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-[#77af9c]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                statistics ⓘ
              </span>
              <div className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-[#285943] group-hover:text-[#285943]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="my-4 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#77af9c]"
                    strokeDasharray="82, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-semibold tracking-tight text-slate-900">82%</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">care index</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3 text-center">
              <p className="text-xs font-semibold text-slate-800">
                {loading ? "—" : totalAppointments} Total Consultations
              </p>
              <p className="text-[11px] text-stone-500">
                {upcomingAppointments} Scheduled upcoming visits
              </p>
            </div>
          </div>

          {/* Tile B: Serene Mental Health / Symptom Assessment */}
          <div 
            onClick={goToSymptomChecker}
            className="group cursor-pointer relative overflow-hidden rounded-[26px] border border-stone-200/80 bg-linear-to-b from-[#E7F2EE] to-[#D5EBE2] p-5 shadow-xs transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-stone-300/60 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold text-[#285943]">
                well-being
              </span>
              <div className="h-7 w-7 rounded-full bg-white/80 flex items-center justify-center text-[#285943] group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-6 mb-2">
              <HeartPulse className="h-7 w-7 text-[#285943] mb-2" />
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                Symptom Assessment & Mental Well-being
              </h4>
              <p className="text-[11px] text-[#285943]/80 mt-1">
                Guided clinical triage & instant care suggestions.
              </p>
            </div>
          </div>
        </div>

        {/* Center Main Tile: Virtual Consultations Video Call Preview (Span 5) */}
        <div  className="lg:col-span-5 rounded-[26px] border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Header pill tags */}
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-0.5 text-[10px] font-semibold text-stone-600">
              virtual consultation ⓘ
            </span>
            <span className="rounded-full bg-[#EBF7F2] text-[#285943] border border-[#77af9c]/40 px-3 py-0.5 text-[10px] font-bold">
              HD Encrypted
            </span>
          </div>

          {/* Simulated Video Consultation Window with Pill Badges (CareSync signature) */}
          <div className="my-5 rounded-2xl bg-linear-to-br from-[#285943] via-[#1E4533] to-[#122D21] p-6 text-white relative overflow-hidden shadow-inner min-h-[220px] flex flex-col justify-between">
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-[#8cd790] animate-pulse" />
                {nextAppointment ? "Upcoming Visits" : "Care Room Ready"}
              </span>
              <Video className="h-5 w-5 text-white/80" />
            </div>

            {/* Doctor Info inside video card */}
            <div className="z-10 my-3">
              <p className="text-[11px] uppercase tracking-wider text-[#8cd790] font-semibold">
                {nextAppointment ? `Scheduled with ${nextAppointment.doctorName || "Care Specialist"}` : "Virtual Walk-in Telehealth"}
              </p>
              <h3 className="text-xl font-medium tracking-tight text-white mt-1">
                {nextAppointment ? (nextAppointment.specialty || "General Medicine") : "Direct Telehealth Platform"}
              </h3>
              <p className="text-xs text-white/70 mt-1">
                {nextAppointment
                  ? `Time: ${nextAppointment.time || "10:00 AM"} • ${nextAppointment.date || "Next visit"}`
                  : "Certified physicians available 24/7 across multiple disciplines."}
              </p>
            </div>

            {/* Floating Glass Pill Bar like Image 2 */}
            <div className="z-10 flex items-center justify-center gap-2 rounded-full bg-black/30 backdrop-blur-md p-1.5 border border-white/10">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-semibold text-white">24/7</span>
               <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-semibold text-white">user-friendly</span>
               <button
                type="button"
                onClick={goToAppointments}
                className="rounded-full bg-[#FA6432] text-white px-3 py-0.5 text-[10px] font-bold hover:scale-105 transition-transform"
              >
                Join / View
              </button>
            </div>
          </div>

          {/* Bottom Card Summary */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-stone-600">
              <span className="font-semibold text-slate-900">{upcomingAppointments}</span> appointments currently active in queue.
            </div>
            <button
              type="button"
              onClick={goToAppointments}
              className="text-xs font-bold text-[#285943] hover:underline flex items-center gap-1"
            >
              <span>Schedule</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Telehealth Solutions & AI Assistant (Span 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-[26px] border border-stone-200/80 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3 justify-between">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                telehealth solutions ⓘ
              </span>
              <button
                type="button"
                onClick={goToDoctors}
                className="rounded-full flex gap-2 bg-[#FA6432] text-white text-[11px] font-bold px-3 py-1 hover:bg-[#e45222] transition-colors"
              >
                Explore <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-xl font-normal tracking-tight text-slate-900">
                Specialized Care On-Demand
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Connect instantly with certified specialists across cardiology, orthopedics, neurology, and internal care.
              </p>
            </div>

            {/* Quick Specialty Pill tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Cardiology", "Neurology", "Pediatrics", "General"].map((spec) => (
                <span
                  key={spec}
                  onClick={goToDoctors}
                  className="cursor-pointer rounded-full border border-stone-200 bg-[#F9FAF8] px-3 py-1 text-[11px] font-medium text-stone-700 hover:border-[#77af9c] hover:text-[#285943] transition-colors"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Embedded AI Assistant Quick Trigger */}
          <div className="mt-6 border-t border-stone-100 pt-4">
            <div className="rounded-2xl bg-[#E8F4F0]/60 p-4 border border-[#77af9c]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#285943] text-white flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Clinical AI Navigator</h5>
                  <p className="text-[11px] text-stone-500">24/7 Health answers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={goToMessages}
                className="rounded-full bg-[#285943] text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-[#1e4533] transition-colors"
              >
                Chat
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── BENTO GRID ROW 2: "BENEFITS & SERVICES" & CLINICAL TIMELINE ── */}
      <div  data-aos="fade-up"
            data-aos-duration="1000"
             className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Benefits & Services Pill Accordions (Exact bottom-left of Image 2) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              benefits
            </span>
            <h2 className="text-2xl font-light text-slate-900">
              Benefits &amp; services.
            </h2>
            <button
              type="button"
              onClick={goToRecords}
              className="text-xs font-semibold text-[#285943] hover:underline"
            >
              Read More &gt;
            </button>
          </div>

          {/* Accordion 1: Prescription Support */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === "prescriptions" ? "" : "prescriptions")}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#E8F4F0] text-[#285943] flex items-center justify-center">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Prescription Support
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {activePrescriptionsCount} active medicines
                  </span>
                </div>
              </div>
              {openSection === "prescriptions" ? (
                <ChevronUp className="h-4 w-4 text-stone-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-400" />
              )}
            </button>

            {openSection === "prescriptions" && (
              <div className="p-4 pt-0 border-t border-stone-100 space-y-2.5">
                {prescriptions.length === 0 ? (
                  <p className="text-xs text-stone-500 py-2">No active prescriptions on record.</p>
                ) : (
                  prescriptions.slice(0, 3).map((rx, idx) => (
                    <div
                      key={rx._id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {rx.medicationName || rx.name || "Medicine"}
                        </p>
                        <p className="text-[10px] text-stone-500">{rx.dosage || "As directed"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={goToPrescriptions}
                        className="font-bold text-[#285943] text-xs hover:underline"
                      >
                        Refill
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Accordion 2: Record Management */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === "records" ? "" : "records")}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#E8F4F0] text-[#285943] flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Record Management
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {totalRecords} diagnostic records verified
                  </span>
                </div>
              </div>
              {openSection === "records" ? (
                <ChevronUp className="h-4 w-4 text-stone-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-400" />
              )}
            </button>

            {openSection === "records" && (
              <div className="p-4 pt-0 border-t border-stone-100 space-y-2">
                {records.length === 0 ? (
                  <p className="text-xs text-stone-500 py-2">No documents uploaded yet.</p>
                ) : (
                  records.slice(0, 3).map((rec, i) => (
                    <div
                      key={rec.id || i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 text-xs"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {rec.title || rec.fileName || "Medical Report"}
                      </span>
                      <button
                        type="button"
                        onClick={goToRecords}
                        className="text-xs font-semibold text-[#285943] hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Floating Appointment Badge from Image 2 */}
          {nextAppointment && (
            <div className="rounded-2xl border border-[#FA6432]/30 bg-[#FFF5F2] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#FA6432] text-white flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">You have an appointment!</p>
                  <p className="text-[11px] text-stone-600">{nextAppointment.doctorName || "Care Physician"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={goToAppointments}
                className="text-xs font-bold text-[#FA6432] hover:underline"
              >
                View now ↗
              </button>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1">
            <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
            <span>Encrypted with HIPAA-compliant standards</span>
          </div>
        </div>

        {/* Right Side: Existing Upcoming Appointments & AI Assistant Cards (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[26px] border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Scheduled Consultations
              </h3>
              <button
                type="button"
                onClick={goToAppointments}
                className="text-xs font-semibold text-[#285943] hover:underline"
              >
                Full Calendar ↗
              </button>
            </div>
            <UpcomingAppointmentsCard />
          </div>

          <div className="rounded-[26px] border border-stone-200/80 bg-white p-2 shadow-xs">
            <AiAssistantCard onStartChat={goToMessages} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default OverviewView;