import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
  Search,
  Printer,
  Stethoscope,
  Phone,
  RefreshCw,
  Pill,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
  Video,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import EmptyState from "../../components/ui/EmptyState";
import { showToast } from "../../redux/slice/uiSlice";
import DoctorWritePrescription from "../../pages/doctor/DoctorWritePrescription";
import {
  fetchDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../redux/slice/appointmentSlice";

// ========================================
// DATE FORMATTING HELPERS (FIXED LOCAL TIMEZONE)
// ========================================

const parseLocalDate = (dateInput) => {
  if (!dateInput) return null;

  // Normalize ISO strings and date strings (e.g., "2026-10-25T00:00:00.000Z" -> "2026-10-25")
  const rawDateStr = typeof dateInput === "string" ? dateInput.split("T")[0] : null;

  if (rawDateStr && /^\d{4}-\d{2}-\d{2}$/.test(rawDateStr)) {
    const [y, m, d] = rawDateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const date = new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDay = (dateStr) => {
  const date = parseLocalDate(dateStr);
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDateKey = (dateStr) => {
  const date = parseLocalDate(dateStr);
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isToday = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
};

const isWithinDays = (dateStr, daysCount = 7) => {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const future = new Date(now);
  future.setDate(future.getDate() + daysCount);
  future.setHours(23, 59, 59, 999);
  return d >= now && d <= future;
};

// ========================================
// FILTER DEFINITIONS
// ========================================

const STATUS_FILTERS = [
  { id: "all", label: "All Encounters" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "missed", label: "Missed" },
];

const PAGE_SIZE = 10;
const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "Next 7 Days" },
  { id: "all", label: "All Dates" },
];

// ========================================
// COMPONENT
// ========================================

const DoctorSchedule = () => {
  const dispatch = useDispatch();

  // Filters & Search State
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Interactive UI States
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);

  // Redux Appointments State
  const {
    appointments = [],
    loading,
    error,
  } = useSelector((state) => state.appointment);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, datePreset, searchQuery]);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  // Automated scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Upcoming Status Check
  const isUpcomingAppointment = (appointment) => {
    const status = appointment?.status?.toLowerCase();
    return status === "pending" || status === "confirmed";
  };

  // Fixed Missed Check (Supports 12-hour AM/PM and 24-hour formats)
  const isMissedAppointment = (appointment) => {
    if (!isUpcomingAppointment(appointment)) return false;
    const date = parseLocalDate(appointment?.appointmentDate);
    if (!date) return false;

    const time = appointment?.endTime || appointment?.startTime;
    if (!time) {
      date.setHours(23, 59, 59, 999);
    } else {
      const match = String(time).match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (!match) return false;
      let hours = Number(match[1]);
      const minutes = Number(match[2]);
      const meridian = match[3]?.toUpperCase();

      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;

      date.setHours(hours, minutes, 0, 0);
    }
    return date.getTime() < Date.now();
  };

  // Manual Refresh Handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchDoctorAppointments()).unwrap();
      dispatch(showToast({ message: "Schedule synced successfully", type: "success" }));
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Print Pass Handler
  const handlePrintSingle = (appointment) => {
    setPrintTarget(appointment);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Schedule Statistics & Metrics
  const stats = useMemo(() => {
    const total = appointments.length;
    const todayList = appointments.filter((a) => isToday(a.appointmentDate));
    const upcomingList = appointments.filter((a) => isUpcomingAppointment(a) && !isMissedAppointment(a));
    const completedList = appointments.filter(
      (a) => a.status?.toLowerCase() === "completed"
    );
    const cancelledList = appointments.filter((a) => {
      const s = a.status?.toLowerCase();
      return s === "cancelled" || s === "rejected";
    });

    const completionRate =
      total > 0 ? Math.round((completedList.length / total) * 100) : 0;

    return {
      total,
      todayCount: todayList.length,
      upcomingCount: upcomingList.length,
      completedCount: completedList.length,
      cancelledCount: cancelledList.length,
      missedCount: appointments.filter(isMissedAppointment).length,
      completionRate,
    };
  }, [appointments]);

  const filterCounts = useMemo(() => {
    return {
      all: appointments.length,
      upcoming: stats.upcomingCount,
      completed: stats.completedCount,
      cancelled: stats.cancelledCount,
      missed: stats.missedCount,
    };
  }, [appointments, stats]);

  // Spotlight Next Upcoming
  const nextUpcoming = useMemo(() => {
    const upcoming = appointments.filter((a) => isUpcomingAppointment(a) && !isMissedAppointment(a));
    if (!upcoming.length) return null;

    return [...upcoming].sort((a, b) => {
      const first = parseLocalDate(a.appointmentDate);
      const second = parseLocalDate(b.appointmentDate);
      const diff = (first?.getTime() || 0) - (second?.getTime() || 0);
      if (diff !== 0) return diff;
      return (a.startTime || "").localeCompare(b.startTime || "");
    })[0];
  }, [appointments]);

  // Filter + Search + Sort + Group
  const groupedAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = appointments.filter((appointment) => {
      const s = appointment.status?.toLowerCase();

      // Status filters
      if (statusFilter === "upcoming" && (!isUpcomingAppointment(appointment) || isMissedAppointment(appointment))) {
        return false;
      }
      if (statusFilter === "missed" && !isMissedAppointment(appointment)) {
        return false;
      }
      if (statusFilter === "cancelled" && s !== "cancelled" && s !== "rejected") {
        return false;
      }
      if (
        statusFilter !== "all" &&
        statusFilter !== "upcoming" &&
        statusFilter !== "missed" &&
        statusFilter !== "cancelled" &&
        s !== statusFilter
      ) {
        return false;
      }

      // Date Presets
      if (datePreset === "today" && !isToday(appointment.appointmentDate)) {
        return false;
      }
      if (datePreset === "tomorrow" && !isTomorrow(appointment.appointmentDate)) {
        return false;
      }
      if (datePreset === "week" && !isWithinDays(appointment.appointmentDate, 7)) {
        return false;
      }

      // Search Query
      if (query) {
        const patientName = (
          appointment.patient?.fullName ||
          appointment.patientName ||
          ""
        ).toLowerCase();
        const reason = (appointment.reason || "").toLowerCase();
        const phone = (appointment.patient?.phone || "").toLowerCase();
        const email = (appointment.patient?.email || "").toLowerCase();

        const matches =
          patientName.includes(query) ||
          reason.includes(query) ||
          phone.includes(query) ||
          email.includes(query);

        if (!matches) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const first = parseLocalDate(a.appointmentDate);
      const second = parseLocalDate(b.appointmentDate);
      const dateDiff = (first?.getTime() || 0) - (second?.getTime() || 0);
      if (dateDiff !== 0) return dateDiff;

      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    const total = sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(currentPage, pageCount);
    const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const groups = new Map();
    pageItems.forEach((appointment) => {
      const dateKey = getDateKey(appointment.appointmentDate);
      if (!dateKey) return;

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey).push(appointment);
    });

    return { groups: Array.from(groups.entries()), total, pageCount };
  }, [appointments, statusFilter, datePreset, searchQuery, currentPage]);

  // Adjust safely if currentPage is out of bounds
  useEffect(() => {
    if (currentPage > groupedAppointments.pageCount) {
      setCurrentPage(groupedAppointments.pageCount);
    }
  }, [groupedAppointments.pageCount, currentPage]);

  // Unified page switch handler with smooth scroll to top
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > groupedAppointments.pageCount || newPage === currentPage) {
      return;
    }
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mark Completed
  const markCompleted = async (appointmentId) => {
    if (!appointmentId) return;

    setActionLoadingId(appointmentId);
    try {
      await dispatch(
        updateAppointmentStatus({
          id: appointmentId,
          status: "completed",
        })
      ).unwrap();

      dispatch(
        showToast({
          message: "Consultation marked as completed",
          type: "success",
        })
      );
      await dispatch(fetchDoctorAppointments()).unwrap();
    } catch (err) {
      console.error("Failed to complete appointment:", err);
      dispatch(
        showToast({
          message: typeof err === "string" ? err : err?.message || "Failed to update appointment",
          type: "error",
        })
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) return;

    setActionLoadingId(appointmentId);
    try {
      await dispatch(cancelAppointment(appointmentId)).unwrap();
      dispatch(
        showToast({
          message: "Appointment cancelled successfully",
          type: "success",
        })
      );
      await dispatch(fetchDoctorAppointments()).unwrap();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      dispatch(
        showToast({
          message: typeof err === "string" ? err : err?.message || "Failed to cancel appointment",
          type: "error",
        })
      );
    } finally {
      setActionLoadingId(null);
      setCancelModalAppointment(null);
    }
  };

  const getStatusVisuals = (status, isMissed = false) => {
    if (isMissed) {
      return {
        pill: "bg-amber-50 text-amber-900 border-amber-200",
        dot: "bg-amber-500",
        indicator: "bg-amber-500",
        label: "Missed Slot",
      };
    }

    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return {
          pill: "bg-emerald-50 text-emerald-900 border-emerald-200",
          dot: "bg-emerald-500",
          indicator: "bg-emerald-500",
          label: "Completed",
        };
      case "cancelled":
      case "rejected":
        return {
          pill: "bg-rose-50 text-rose-900 border-rose-200",
          dot: "bg-rose-500",
          indicator: "bg-rose-500",
          label: "Cancelled",
        };
      case "confirmed":
        return {
          pill: "bg-teal-50 text-teal-900 border-teal-200",
          dot: "bg-teal-500",
          indicator: "bg-teal-500",
          label: "Confirmed",
        };
      default:
        return {
          pill: "bg-teal-50 text-teal-800 border-teal-200",
          dot: "bg-teal-500",
          indicator: "bg-teal-500",
          label: "Scheduled",
        };
    }
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || datePreset !== "all";

  return (
    <div className="min-h-screen w-full bg-[#FAFAF8] text-slate-800 antialiased pt-20 sm:pt-24 pb-20 selection:bg-teal-500/20 font-sans">
      
      {/* PRINT-ONLY ISOLATED TICKET */}
      {printTarget && (
        <div id="print-ticket-section" className="hidden p-8 text-slate-900 bg-white">
          <div className="max-w-2xl mx-auto border-2 border-teal-900/40 rounded-2xl p-8 space-y-6 shadow-none">
            <div className="flex justify-between items-start border-b pb-4 border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">MedCare Clinical Suite</span>
                </div>
                <h1 className="text-2xl font-serif italic text-slate-900 mt-1">
                  Consultation Appointment Pass
                </h1>
                <p className="text-xs text-slate-500">Official Clinical Appointment &amp; Verification Slip</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full">
                  {printTarget.status || "Scheduled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Patient Name</p>
                <p className="text-base font-bold text-slate-900">
                  {printTarget.patient?.fullName || printTarget.patientName || "Walk-in Patient"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Contact Phone</p>
                <p className="font-semibold text-slate-800">
                  {printTarget.patient?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Appointment Date</p>
                <p className="font-bold text-slate-900">
                  {formatDay(printTarget.appointmentDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Slot Timing</p>
                <p className="font-bold text-teal-800">
                  {printTarget.startTime || "--:--"} {printTarget.endTime && ` - ${printTarget.endTime}`}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">Consultation Purpose</p>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {printTarget.reason || "General Medical Consultation"}
              </p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-6 mt-8 flex justify-between text-xs text-slate-500">
              <div>Printed on: {new Date().toLocaleString()}</div>
              <div>Authorized Signatory: ____________________</div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-7">
        
        {/* ── 1. EDITORIAL CLINICAL HEADER ── */}
        <div className="pt-2 sm:pt-4 border-b border-stone-200/80 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                  Clinical Agenda
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500 font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight leading-tight">
                Consultation{" "}
                <span className="font-serif italic font-normal text-teal-800">
                  Schedule
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl font-normal">
                Manage your patient appointments, clinical timelines, and active care encounters.
              </p>
            </div>

            {/* Quick Actions & Inline Encounter Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Subtle Inline Counter Badge */}
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 shadow-2xs">
                <span className="font-bold text-slate-900">{stats.todayCount}</span>
                <span>today</span>
                <span className="text-stone-300">•</span>
                <span className="font-bold text-teal-700">{stats.upcomingCount}</span>
                <span>upcoming</span>
                {stats.missedCount > 0 && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="font-bold text-amber-700">{stats.missedCount}</span>
                    <span>missed</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                title="Sync Schedule"
              >
                <RefreshCw
                  size={13}
                  className={`text-teal-700 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? "Syncing..." : "Sync"}</span>
              </button>

              <Link
                to="/doctor/prescriptions/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 active:scale-95 transition-all"
              >
                <Pill size={13} className="text-teal-200" />
                <span>Write Rx</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. ACTIVE ENCOUNTER / NEXT UP SPOTLIGHT (HUMAN, NON-DASHBOARD) ── */}
        {nextUpcoming && (
          <div className="relative overflow-hidden rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/50 via-white to-stone-50/50 p-4 sm:p-5 shadow-xs transition-all">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
              
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-800 text-sm sm:text-base font-semibold text-white shadow-xs">
                  {(
                    nextUpcoming.patient?.fullName ||
                    nextUpcoming.patientName ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Next Encounter
                    </span>
                    <span className="text-xs font-bold text-teal-950 flex items-center gap-1">
                      <Clock size={12} className="text-teal-700" />
                      {nextUpcoming.startTime || "--:--"}
                      {nextUpcoming.endTime && ` - ${nextUpcoming.endTime}`}
                    </span>
                    <span className="text-stone-300 text-xs">•</span>
                    <span className="text-xs font-medium text-stone-600">
                      {isToday(nextUpcoming.appointmentDate)
                        ? "Today"
                        : formatDay(nextUpcoming.appointmentDate)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    {nextUpcoming.patient?.fullName ||
                      nextUpcoming.patientName ||
                      "Patient"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white border border-stone-200 px-2 py-0.5 text-[11px] text-stone-700 font-medium">
                      <Stethoscope size={11} className="text-teal-700" />
                      {nextUpcoming.reason || "General Medical Consultation"}
                    </span>
                    {nextUpcoming.patient?.phone && (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Phone size={10} />
                        {nextUpcoming.patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fast Encounter Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handlePrintSingle(nextUpcoming)}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
                  title="Print slip"
                >
                  <Printer size={12} className="text-stone-500" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    markCompleted(nextUpcoming._id || nextUpcoming.id)
                  }
                  disabled={
                    actionLoadingId ===
                    (nextUpcoming._id || nextUpcoming.id)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoadingId ===
                  (nextUpcoming._id || nextUpcoming.id) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} strokeWidth={2.8} />
                  )}
                  <span>Complete Visit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. INTUITIVE TIMELINE CONTROLS (SEARCH & DATE STRIP) ── */}
        <div className="space-y-3">
          
          {/* Top Row: Search Input + Date Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, complaint, phone..."
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-stone-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Date Preset Pills */}
            <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto">
              <div className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 shadow-2xs">
                {DATE_PRESETS.map((preset) => {
                  const isActive = datePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setDatePreset(preset.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-teal-800 text-white font-semibold shadow-2xs"
                          : "text-stone-600 hover:text-slate-900 hover:bg-stone-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDatePreset("all");
                  }}
                  className="ml-1 text-[11px] font-semibold text-teal-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Status Filter Tabs (Scrollable on mobile) */}
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STATUS_FILTERS.map((item) => {
                const isActive = statusFilter === item.id;
                const count = filterCounts[item.id] ?? 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white font-semibold"
                        : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                        isActive
                          ? "bg-slate-700 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline text-xs text-stone-400 font-medium shrink-0">
              {groupedAppointments.total} {groupedAppointments.total === 1 ? "appointment" : "appointments"}
            </span>
          </div>
        </div>

        {/* ── 4. LOADING STATE ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-16 shadow-2xs">
            <Loader2 className="h-7 w-7 animate-spin text-teal-700" />
            <h3 className="mt-3 text-xs sm:text-sm font-medium text-stone-600">
              Syncing consultation agenda...
            </h3>
          </div>
        )}

        {/* ── 5. ERROR STATE ── */}
        {!loading && error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="font-bold">Error loading schedule</p>
              <p className="text-[11px] text-rose-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-50 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── 6. EMPTY STATE ── */}
        {!loading && !error && groupedAppointments.groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <EmptyState
              icon={CalendarDays}
              title={
                searchQuery
                  ? "No matching appointments found"
                  : `No ${statusFilter !== "all" ? statusFilter : ""} appointments scheduled`
              }
              description={
                searchQuery
                  ? "Try adjusting your search query or reset the active filters."
                  : "Patient bookings for these dates will automatically appear in your clinical agenda."
              }
            />
          </div>
        )}

        {/* ── 7. DAY-BY-DAY PATIENT ENCOUNTER LIST ── */}
        {!loading &&
          !error &&
          groupedAppointments.groups.map(([date, appointmentsForDate]) => {
            const isDayToday = isToday(date);
            const isDayTomorrow = isTomorrow(date);

            return (
              <div key={date} className="space-y-3">
                {/* Day Header Separator */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                      {formatDay(date)}
                    </h2>
                    {isDayToday && (
                      <span className="rounded-full bg-teal-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Today
                      </span>
                    )}
                    {isDayTomorrow && (
                      <span className="rounded-full bg-stone-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Tomorrow
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-medium text-stone-500">
                    {appointmentsForDate.length}{" "}
                    {appointmentsForDate.length === 1 ? "Patient" : "Patients"}
                  </span>
                </div>

                {/* Appointment Encounter Cards */}
                <div className="space-y-2.5">
                  {appointmentsForDate.map((appointment) => {
                    const appointmentId = appointment._id || appointment.id;
                    const patientId =
                      appointment.patient?._id || appointment.patient || "";
                    const patientName =
                      appointment.patient?.fullName ||
                      appointment.patientName ||
                      "Patient";
                    const status = appointment.status?.toLowerCase();
                    const isMissed = isMissedAppointment(appointment);
                    const isUpcoming = isUpcomingAppointment(appointment) && !isMissed;
                    const visual = getStatusVisuals(status, isMissed);

                    const patientInitial =
                      patientName.trim().charAt(0).toUpperCase() || "P";
                    const isCardLoading = actionLoadingId === appointmentId;

                    return (
                      <div
                        key={appointmentId}
                        className="group relative rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all"
                      >
                        {/* ========================================= */}
                        {/* DESKTOP / TABLET ENCOUNTER ROW            */}
                        {/* ========================================= */}
                        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                          
                          {/* Left: Time & Encounter Meta */}
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            
                            {/* Time Slot Block */}
                            <div className="flex w-28 shrink-0 flex-col justify-center border-r border-stone-100 pr-3">
                              <span className="text-sm font-bold text-slate-900 tracking-tight">
                                {appointment.startTime || "--:--"}
                              </span>
                              {appointment.endTime && (
                                <span className="text-[11px] text-stone-500 font-medium">
                                  until {appointment.endTime}
                                </span>
                              )}
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${visual.dot}`} />
                                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                  {isMissed ? "Missed" : status || "Scheduled"}
                                </span>
                              </div>
                            </div>

                            {/* Patient Avatar & Clinical Details */}
                            <div className="flex min-w-0 flex-1 items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/80 text-sm font-bold text-teal-800">
                                {patientInitial}
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={patientId ? `/doctor/patients/${patientId}` : "#"}
                                    className="truncate text-sm font-semibold text-slate-900 hover:text-teal-800 transition-colors"
                                  >
                                    {patientName}
                                  </Link>

                                  {isMissed && (
                                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800">
                                      <AlertCircle size={9} /> Missed Slot
                                    </span>
                                  )}

                                  {appointment.appointmentType && (
                                    <span className="inline-flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.2 text-[9px] font-semibold uppercase text-stone-600">
                                      {appointment.appointmentType.toLowerCase() === "video" ? (
                                        <Video size={9} className="text-teal-700" />
                                      ) : (
                                        <MapPin size={9} className="text-stone-500" />
                                      )}
                                      {appointment.appointmentType}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-600">
                                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-700">
                                    <Stethoscope size={11} className="shrink-0 text-teal-700" />
                                    <span className="truncate max-w-xs md:max-w-md">
                                      {appointment.reason || "General Medical Consultation"}
                                    </span>
                                  </span>

                                  {appointment.patient?.phone && (
                                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-400">
                                      <Phone size={9} />
                                      {appointment.patient.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Buttons */}
                          <div className="flex shrink-0 items-center gap-2">
                            {/* Print Pass */}
                            <button
                              type="button"
                              onClick={() => handlePrintSingle(appointment)}
                              title="Print encounter pass"
                              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Printer size={12} className="text-stone-500" />
                              <span className="hidden lg:inline">Pass</span>
                            </button>

                            {isUpcoming ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isCardLoading}
                                  onClick={() => markCompleted(appointmentId)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-900 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                  {isCardLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Check size={12} strokeWidth={2.8} />
                                  )}
                                  <span>Complete Visit</span>
                                </button>

                                <Link
                                  to={`/doctor/prescriptions/new?patient=${patientId}`}
                                  title="Write prescription"
                                  className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
                                >
                                  <Pill size={11} />
                                  <span>Rx</span>
                                </Link>

                                <button
                                  type="button"
                                  title="Cancel encounter"
                                  disabled={isCardLoading}
                                  onClick={() => setCancelModalAppointment(appointment)}
                                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white h-8 w-8 text-stone-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              </>
                            ) : isMissed ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Missed Slot
                                </span>

                                <button
                                  type="button"
                                  disabled={isCardLoading}
                                  onClick={() => markCompleted(appointmentId)}
                                  title="Mark completed if consultation occurred"
                                  className="inline-flex items-center gap-1 rounded-xl bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-900 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                  {isCardLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Check size={12} strokeWidth={2.8} />
                                  )}
                                  <span>Complete</span>
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${visual.pill}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${visual.dot}`} />
                                  {visual.label}
                                </span>

                                {status === "completed" && (
                                  <button
                                    type="button"
                                    onClick={() => setPrescriptionModal(true)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:underline cursor-pointer"
                                  >
                                    <Pill size={11} />
                                    <span>Rx</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ========================================= */}
                        {/* MOBILE ENCOUNTER CARD VIEW (Below sm)      */}
                        {/* ========================================= */}
                        <div className="flex flex-col gap-2.5 sm:hidden">
                          {/* Row 1: Time & Status Pill */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 bg-stone-100 px-2 py-0.5 rounded-md">
                                {appointment.startTime || "--:--"}
                                {appointment.endTime && ` - ${appointment.endTime}`}
                              </span>
                              {appointment.appointmentType && (
                                <span className="inline-flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.2 text-[9px] font-semibold uppercase text-stone-600">
                                  {appointment.appointmentType.toLowerCase() === "video" ? (
                                    <Video size={9} className="text-teal-700" />
                                  ) : (
                                    <MapPin size={9} className="text-stone-500" />
                                  )}
                                  {appointment.appointmentType}
                                </span>
                              )}
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${visual.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${visual.dot}`} />
                              {visual.label}
                            </span>
                          </div>

                          {/* Row 2: Patient Info */}
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/80 text-xs font-bold text-teal-800">
                              {patientInitial}
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                to={patientId ? `/doctor/patients/${patientId}` : "#"}
                                className="text-xs font-semibold text-slate-900 hover:text-teal-800 transition-colors block truncate"
                              >
                                {patientName}
                              </Link>
                              <div className="mt-0.5 text-[11px] text-stone-600 flex items-center gap-1 truncate">
                                <Stethoscope size={10} className="shrink-0 text-teal-700" />
                                <span className="truncate">{appointment.reason || "General Consultation"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Action Buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => handlePrintSingle(appointment)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700"
                            >
                              <Printer size={11} />
                              <span>Pass</span>
                            </button>

                            {isUpcoming && (
                              <>
                                <Link
                                  to={`/doctor/prescriptions/new?patient=${patientId}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900"
                                >
                                  <Pill size={11} />
                                  <span>Rx</span>
                                </Link>

                                <button
                                  type="button"
                                  disabled={isCardLoading}
                                  onClick={() => markCompleted(appointmentId)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-900 disabled:opacity-50"
                                >
                                  {isCardLoading ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <Check size={11} strokeWidth={2.8} />
                                  )}
                                  <span>Complete</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isCardLoading}
                                  onClick={() => setCancelModalAppointment(appointment)}
                                  className="inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white h-7.5 w-7.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <X size={11} strokeWidth={2.5} />
                                </button>
                              </>
                            )}

                            {isMissed && (
                              <button
                                type="button"
                                disabled={isCardLoading}
                                onClick={() => markCompleted(appointmentId)}
                                className="inline-flex items-center gap-1 rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-900 disabled:opacity-50"
                              >
                                {isCardLoading ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} strokeWidth={2.8} />
                                )}
                                <span>Complete</span>
                              </button>
                            )}

                            {status === "completed" && (
                              <button
                                type="button"
                                onClick={() => setPrescriptionModal(true)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:underline px-2 py-1"
                              >
                                <Pill size={11} />
                                <span>Rx</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {/* ── 8. PAGINATION ── */}
        {groupedAppointments.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-stone-200/80">
            <p className="text-xs text-stone-500">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, groupedAppointments.total)}–
              {Math.min(currentPage * PAGE_SIZE, groupedAppointments.total)} of {groupedAppointments.total} consultations
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <span className="px-2 text-xs font-semibold text-stone-700">
                {Math.min(currentPage, groupedAppointments.pageCount)} / {groupedAppointments.pageCount}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= groupedAppointments.pageCount}
                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Cancel Consultation?
                </h3>
                <p className="text-xs text-stone-500">
                  This action will release the slot and notify the patient.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-700 space-y-1">
              <p>
                <strong className="text-slate-900 font-semibold">Patient:</strong>{" "}
                {cancelModalAppointment.patient?.fullName ||
                  cancelModalAppointment.patientName ||
                  "Patient"}
              </p>
              <p>
                <strong className="text-slate-900 font-semibold">Schedule:</strong>{" "}
                {formatDay(cancelModalAppointment.appointmentDate)} at{" "}
                {cancelModalAppointment.startTime || "Scheduled time"}
              </p>
              <p>
                <strong className="text-slate-900 font-semibold">Reason:</strong>{" "}
                {cancelModalAppointment.reason || "General Consultation"}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCancelAppointment(
                    cancelModalAppointment._id || cancelModalAppointment.id
                  )
                }
                disabled={
                  actionLoadingId ===
                  (cancelModalAppointment._id || cancelModalAppointment.id)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {actionLoadingId ===
                (cancelModalAppointment._id || cancelModalAppointment.id) ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <X size={13} strokeWidth={2.5} />
                )}
                <span>Confirm Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WRITE PRESCRIPTION MODAL */}
      {prescriptionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          onClick={() => setPrescriptionModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl border border-stone-200 bg-[#FAFBF9] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto w-full max-w-4xl"
          >
            <DoctorWritePrescription
              isOpen={prescriptionModal}
              onClose={() => setPrescriptionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
