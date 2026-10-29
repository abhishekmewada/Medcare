import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Clock,
  Check,
  HeartPulse,
   ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  createAppointment,
  fetchMyAppointments,
} from "../../redux/slice/appointmentSlice";

import {
  fetchDoctorAvailability,
} from "../../redux/slice/availabilitySlice";

import {
  useAppointment,
} from "../../context/AppointmentContext";

// ==========================================
// AVATAR URL RESOLVER
// ==========================================

const resolveAvatarUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
};

const BookVisitModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: availabilityLoading, availability } = useSelector(
    (state) => state.availability
  );

  const {
    loading,
    error,
  } = useSelector(
    (state) => state.appointment
  );

  const {
    selectedDoctor,
    isBookVisitModalOpen,
    closeBookVisitModal,
  } = useAppointment();

  // ==========================================
  // STATE
  // ==========================================

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ==========================================
  // GET DOCTOR ID
  // ==========================================

  const doctorId =
    selectedDoctor?.doctorId ||
    selectedDoctor?._id ||
    null;

  // ==========================================
  // FETCH DOCTOR AVAILABILITY
  // ==========================================

  useEffect(() => {
    if (!isBookVisitModalOpen || !doctorId) {
      return;
    }

    dispatch(fetchDoctorAvailability(doctorId));
  }, [dispatch, isBookVisitModalOpen, doctorId]);

  // ==========================================
  // DATE CHANGE
  // ==========================================

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setTime("");

    if (!selectedDate) {
      setAvailableSlots([]);
      setSelectedAvailability(null);
      return;
    }

    const dayName = new Date(
      `${selectedDate}T00:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const dayAvailability = (availability || []).find(
      (item) => item.day === dayName && item.isAvailable === true
    );

    if (!dayAvailability || !dayAvailability.isAvailable) {
      setAvailableSlots([]);
      return;
    }

    setAvailableSlots(dayAvailability.slots || []);
    setSelectedAvailability(dayAvailability);
  };

  // ==========================================
  // TIME CHANGE
  // ==========================================

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setTime(selectedTime);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      return;
    }

    if (!doctorId) {
      console.error("Doctor ID missing");
      return;
    }

    if (!selectedAvailability?._id) {
      console.error("Availability ID missing");
      return;
    }

    if (!time) {
      console.error("Time slot not selected");
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => slot.startTime === time
    );

    if (!selectedSlot) {
      console.error("Selected time slot not found");
      return;
    }

    const consultationTypes = Array.isArray(selectedDoctor.consultationType)
      ? selectedDoctor.consultationType
      : selectedDoctor.consultationType
      ? [selectedDoctor.consultationType]
      : [];

    const resolvedAppointmentType = consultationTypes.includes("in-person")
      ? "in-person"
      : consultationTypes.includes("video")
      ? "video"
      : "in-person";

    const appointmentData = {
      doctor: doctorId,
      availability: selectedAvailability._id,
      appointmentDate: date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      appointmentType: resolvedAppointmentType,
      reason: reason.trim(),
      notes: "Scheduled via MedCare Patient Portal.",
    };

    try {
      await dispatch(createAppointment(appointmentData)).unwrap();
      await dispatch(fetchMyAppointments()).unwrap();
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setReason("");
        setDate("");
        setTime("");
        setSelectedAvailability(null);
        setAvailableSlots([]);
        closeBookVisitModal();
        navigate("/patient");
      }, 1200);
    } catch (err) {
      console.error("Appointment booking failed:", err);
    }
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  if (!isBookVisitModalOpen || !selectedDoctor) {
    return null;
  }

  const doctorInitials = (
    selectedDoctor.fullName ||
    selectedDoctor.name ||
    "D"
  )
    .replace("Dr. ", "")
    .charAt(0)
    .toUpperCase();

  const doctorAvatar = resolveAvatarUrl(selectedDoctor.avatar);
  const hasAvatar = doctorAvatar && !imgError;

  const consultationTypes = Array.isArray(selectedDoctor.consultationType)
    ? selectedDoctor.consultationType
    : selectedDoctor.consultationType
    ? [selectedDoctor.consultationType]
    : [];

  const consultationTypeBadge = (() => {
    if (
      consultationTypes.includes("video") &&
      consultationTypes.includes("in-person")
    ) {
      return "In-Clinic / Video";
    }
    if (consultationTypes.includes("video")) {
      return "Video Call";
    }
    return "In-Clinic";
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300"
      onClick={closeBookVisitModal}
    >
      <div
        className="relative w-full max-w-lg rounded-[32px] border border-stone-200/80 bg-[#FAFBF9] p-6 sm:p-8 shadow-2xl transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Blur */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#DDF4EC] blur-3xl opacity-70" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={closeBookVisitModal}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-2xs"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── SUCCESS STATE ── */}
        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#DDF4EC] text-[#285943] shadow-inner">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="rounded-full border border-[#77af9c]/40 bg-white px-3 py-0.5 text-[11px] font-semibold text-[#285943]">
                confirmed
              </span>
              <h3 className="text-2xl font-light text-slate-900">
                Appointment <span className="font-medium text-[#285943]">Confirmed!</span>
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Your consultation with{" "}
                <strong className="text-slate-800">
                  {selectedDoctor.fullName || selectedDoctor.name || "Doctor"}
                </strong>{" "}
                has been successfully scheduled.
              </p>
            </div>
          </div>
        ) : (
          /* ── BOOKING FORM ── */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* MODAL HEADER */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#285943]">
                <Sparkles className="h-3 w-3 text-[#77af9c]" />
                <span>clinical booking</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 leading-tight">
                Schedule a{" "}
                <span className="inline-block rounded-full border border-slate-900/30 bg-white px-3.5 py-0.5 font-normal italic text-slate-900 shadow-2xs">
                  consultation
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Select your preferred date, verified slot, and consultation reason.
              </p>
            </div>

            {/* SELECTED DOCTOR BENTO PILL */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#DDF4EC] text-[#285943] font-bold text-base shadow-xs">
                  {hasAvatar ? (
                    <img
                      src={doctorAvatar}
                      alt={selectedDoctor.fullName || selectedDoctor.name || "Doctor"}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <span>{doctorInitials}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#77af9c] uppercase tracking-wider block">
                    Assigned Physician
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedDoctor.fullName || selectedDoctor.name || "Doctor"}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {selectedDoctor.specialty || selectedDoctor.specialization || "Specialist"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F7F8F5] border border-stone-200 px-2.5 py-1 text-[10px] font-semibold text-stone-600">
                {consultationTypeBadge}
              </span>
            </div>

            {/* DATE & TIME BENTO ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-[#77af9c]" />
                  <span>Consultation Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20 shadow-2xs"
                />
              </div>

              {/* Time Slots Select */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-[#77af9c]" />
                  <span>Available Slot</span>
                </label>

                {availabilityLoading ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs text-stone-500">
                    Checking schedules...
                  </div>
                ) : !date ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-3 py-2.5 text-xs text-stone-400">
                    Select a date first
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-600">
                    No slots for this day
                  </div>
                ) : (
                  <select
                    value={time}
                    onChange={handleTimeChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition-all focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20 shadow-2xs"
                  >
                    <option value="">Select Time Slot</option>
                    {availableSlots.map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* REASON TEXTAREA */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="h-3.5 w-3.5 text-[#77af9c]" />
                  <span>Reason for Visit / Symptoms</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">Required</span>
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g. Routine checkup, recurring headache, medication consultation..."
                rows={3}
                required
                className="w-full resize-none rounded-2xl border border-stone-200 bg-white p-3 text-xs text-slate-800 outline-none transition-all placeholder:text-stone-400 focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20 shadow-2xs"
              />
            </div>

            {/* ERROR NOTICE */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600">
                {error}
              </div>
            )}

            {/* MODAL FOOTER & SUBMIT */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="h-3.5 w-3.5 text-[#77af9c]" />
                <span className="hidden sm:inline">HIPAA Encrypted</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeBookVisitModal}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !selectedAvailability || !time}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FA6432] hover:bg-[#e45222] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span>{loading ? "Scheduling..." : "Confirm Booking"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default BookVisitModal;