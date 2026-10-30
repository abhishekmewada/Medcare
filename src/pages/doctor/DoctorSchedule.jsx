import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  X,
  Clock,
  CalendarCheck,
  AlertCircle,
  FileText,
  Loader2,
  Search,
  Printer,
  Stethoscope,
  Phone,
  Sparkles,
  RefreshCw,
  Pill,
  CheckCircle2,
  Calendar,
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
  { id: "all", label: "All Consultations" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "missed", label: "Missed / Expired" },
];

const PAGE_SIZE = 10;
const DATE_PRESETS = [
  { id: "all", label: "All Dates" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "Next 7 Days" },
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

  const getStatusVisuals = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
          dot: "bg-emerald-500",
          bar: "bg-emerald-500",
        };
      case "cancelled":
      case "rejected":
        return {
          pill: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
          dot: "bg-rose-500",
          bar: "bg-rose-500",
        };
      case "confirmed":
        return {
          pill: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
          dot: "bg-teal-500",
          bar: "bg-teal-500",
        };
      default:
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
          dot: "bg-amber-500",
          bar: "bg-amber-500",
        };
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full bg-linear-to-b from-slate-50 via-teal-50/20 to-slate-100/70 text-slate-800 antialiased  pt-24 md:pt-28 pb-20 selection:bg-teal-500/20">
      
      {/* PRINT-ONLY ISOLATED TICKET */}
      {/* <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-ticket-section, #print-ticket-section * {
            visibility: visible;
          }
          #print-ticket-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
        }
      `}</style> */}

      {printTarget && (
        <div id="print-ticket-section" className="hidden p-8 text-slate-900 bg-white">
          <div className="max-w-2xl mx-auto border-2 border-teal-900/40 rounded-2xl p-8 space-y-6 shadow-none">
            <div className="flex justify-between items-start border-b pb-4 border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">MedCare Clinical Suite</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  CONSULTATION APPOINTMENT PASS
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

      {/* AMBIENT BACKGROUND ACCENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 right-10 h-125 w-125 rounded-full bg-teal-400/10 blur-[130px] dark:bg-teal-500/10" />
        <div className="absolute top-1/3 -left-36 h-115 w-115 rounded-full bg-emerald-400/10 blur-[120px] dark:bg-emerald-500/10" />
        <div className="absolute -bottom-20 right-1/4 h-105 w-105 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-500/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1920px] space-y-8 px-4 sm:px-8 md:px-14 lg:px-20">
        
        {/* HEADER HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 backdrop-blur-md shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/70 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                </span>
                <span className="tracking-wide">MedCare Clinical Stream</span>
                <span className="text-teal-300 dark:text-teal-700">•</span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                Consultation Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Real-time patient appointments, clinical timelines, and active medical management.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-800 active:scale-95 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 transition-all cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={`text-teal-600 dark:text-teal-400 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                <span>{refreshing ? "Syncing..." : "Sync Schedule"}</span>
              </button>

              <Link
                to="/doctor/prescriptions/"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-95"
              >
                <Pill size={14} className="text-teal-100" />
                <span>Issue Prescription</span>
              </Link>
            </div>
          </div>
        </div>

        {/* CLINICAL KPI METRIC CARDS */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4.5 backdrop-blur-md shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Queue
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <CalendarDays size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.todayCount}
              </span>
              <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                Scheduled Today
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{
                  width: `${stats.total > 0 ? (stats.todayCount / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4.5 backdrop-blur-md shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upcoming Slots
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.upcomingCount}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Pending / Confirmed
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${stats.total > 0 ? (stats.upcomingCount / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4.5 backdrop-blur-md shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.completedCount}
              </span>
              <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200/70 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
                {stats.completionRate}% Rate
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4.5 backdrop-blur-md shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Consultations
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {stats.cancelledCount} Cancelled
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>Overall activity</span>
              <span className="text-teal-600 font-semibold">100% Synced</span>
            </div>
          </div>
        </div>

        {/* NEXT UP SPOTLIGHT */}
        {nextUpcoming && (
          <div className="relative overflow-hidden rounded-3xl border border-teal-200/90 bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/30 p-5 shadow-xs sm:p-6 dark:border-teal-500/20 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-600 text-lg font-black text-white shadow-md shadow-teal-700/20">
                  {(
                    nextUpcoming.patient?.fullName ||
                    nextUpcoming.patientName ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                  <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 text-[10px] text-white">
                    <Sparkles size={9} />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Next Up in Queue
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-300">
                      <Clock size={12} />
                      {nextUpcoming.startTime || "--:--"}
                      {nextUpcoming.endTime && ` - ${nextUpcoming.endTime}`}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isToday(nextUpcoming.appointmentDate)
                        ? "Today"
                        : formatDay(nextUpcoming.appointmentDate)}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {nextUpcoming.patient?.fullName ||
                      nextUpcoming.patientName ||
                      "Patient"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/90 border border-slate-200/80 px-2.5 py-0.5 font-medium text-slate-800 shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                      <Stethoscope size={12} className="text-teal-600" />
                      {nextUpcoming.reason || "General Consultation"}
                    </span>
                    {nextUpcoming.patient?.phone && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Phone size={11} />
                        {nextUpcoming.patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Spotlight Fast Actions */}
              <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => handlePrintSingle(nextUpcoming)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Print this pass"
                >
                  <Printer size={13} className="text-slate-500" />
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
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoadingId ===
                  (nextUpcoming._id || nextUpcoming.id) ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} strokeWidth={2.8} />
                  )}
                  <span>Complete Visit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH & DUAL FILTER STRIP */}
        <div className="space-y-3 sticky top-6 z-40 rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-xl shadow-xs sm:p-5 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, reason, symptoms, phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Date Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Date:
              </span>
              {DATE_PRESETS.map((preset) => {
                const isActive = datePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDatePreset(preset.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-teal-700 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Tabs Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((item) => {
                const isActive = statusFilter === item.id;
                const count = filterCounts[item.id] ?? 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-teal-700 text-white shadow-xs"
                        : "text-slate-600 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`inline-flex min-w-4.5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-teal-100 text-teal-900"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {(searchQuery || statusFilter !== "all" || datePreset !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDatePreset("all");
                }}
                className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400 cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 py-20 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">
              Syncing Clinical Consultations
            </h3>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="font-bold">Error loading schedule</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 dark:bg-slate-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && groupedAppointments.groups.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/90 p-12 text-center backdrop-blur-md shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <EmptyState
              icon={CalendarDays}
              title={
                searchQuery
                  ? "No matching appointments found"
                  : `No ${statusFilter !== "all" ? statusFilter : ""} appointments scheduled`
              }
              description={
                searchQuery
                  ? "Try adjusting your search query or removing the active filters."
                  : "When patients book consultations for these dates, they will automatically appear here."
              }
            />
          </div>
        )}

        {/* APPOINTMENT GROUPS & BOXES */}
        {!loading &&
          !error &&
          groupedAppointments.groups.map(([date, appointmentsForDate]) => {
            const isDayToday = isToday(date);
            const isDayTomorrow = isTomorrow(date);

            return (
              <div
                key={date}
                className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/95"
              >
                {/* Header for Day Group */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 via-slate-50/40 to-white px-6 py-4 dark:border-slate-800 dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                      <Calendar size={15} />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatDay(date)}
                      </h2>
                      {isDayToday && (
                        <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Today
                        </span>
                      )}
                      {isDayTomorrow && (
                        <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Tomorrow
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-bold text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-teal-300">
                    {appointmentsForDate.length}{" "}
                    {appointmentsForDate.length === 1 ? "Consultation" : "Consultations"}
                  </span>
                </div>

                {/* List Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {appointmentsForDate.map((appointment) => {
                    const appointmentId = appointment._id || appointment.id;
                    const patientId =
                      appointment.patient?._id || appointment.patient || "";
                    const patientName =
                      appointment.patient?.fullName ||
                      appointment.patientName ||
                      "Patient";
                    const status = appointment.status?.toLowerCase();
                    const isUpcoming = isUpcomingAppointment(appointment) && !isMissedAppointment(appointment);
                    const visual = getStatusVisuals(status);

                    const patientInitial =
                      patientName.trim().charAt(0).toUpperCase() || "P";
                    const isCardLoading = actionLoadingId === appointmentId;

                    return (
                      <div
                        key={appointmentId}
                        className="group relative flex flex-col justify-between gap-4 p-5 transition-all duration-200 hover:bg-teal-50/30 sm:flex-row sm:items-center sm:gap-6 dark:hover:bg-slate-800/40"
                      >
                        <div
                          className={`absolute bottom-0 left-0 top-0 w-1.5 rounded-l ${visual.bar} opacity-75 group-hover:opacity-100 transition-opacity`}
                        />

                        {/* LEFT: TIME & PATIENT */}
                        <div className="flex min-w-0 flex-1 items-start sm:items-center gap-4">
                          <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 px-1.5 text-center transition-all group-hover:border-teal-300 group-hover:bg-white dark:border-slate-800 dark:bg-slate-800/80">
                            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                              {appointment.startTime || "--:--"}
                            </span>
                            {appointment.endTime && (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                to {appointment.endTime}
                              </span>
                            )}
                            <div className="mt-1 flex items-center gap-1 border-t border-slate-200/80 pt-1 dark:border-slate-700/60">
                              <span className={`h-1.5 w-1.5 rounded-full ${visual.dot}`} />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {isMissedAppointment(appointment) ? "missed" : status || "scheduled"}
                              </span>
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-1 items-start sm:items-center gap-3.5">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-600 text-sm font-bold text-white shadow-xs">
                              {patientInitial}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  to={patientId ? `/doctor/patients/${patientId}` : "#"}
                                  className="truncate text-sm font-bold text-slate-900 transition-colors hover:text-teal-700 dark:text-white dark:hover:text-teal-300"
                                >
                                  {patientName}
                                </Link>

                                {isMissedAppointment(appointment) && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                    <AlertCircle size={10} /> Missed Slot
                                  </span>
                                )}

                                {appointment.appointmentType && (
                                  <span className="rounded-md border border-slate-200 bg-slate-100/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {appointment.appointmentType}
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  <FileText
                                    size={11}
                                    className="shrink-0 text-teal-600 dark:text-teal-400"
                                  />
                                  <span className="truncate max-w-xs">
                                    {appointment.reason || "General Consultation"}
                                  </span>
                                </span>

                                {appointment.patient?.phone && (
                                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Phone size={10} />
                                    {appointment.patient.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: ACTIONS & PRINT */}
                        <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handlePrintSingle(appointment)}
                            title="Print this appointment pass"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                          >
                            <Printer size={13} className="text-slate-500" />
                            <span className="hidden md:inline">Print Pass</span>
                          </button>

                          {isUpcoming ? (
                            <>
                              <button
                                type="button"
                                disabled={isCardLoading}
                                onClick={() => markCompleted(appointmentId)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {isCardLoading ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} strokeWidth={3} />
                                )}
                                <span>Complete</span>
                              </button>

                              <Link
                                to={`/doctor/prescriptions/new?patient=${patientId}`}
                                title="Write prescription"
                                className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300 transition-colors"
                              >
                                <Pill size={12} />
                                <span className="hidden sm:inline">Rx</span>
                              </Link>

                              <button
                                type="button"
                                title="Cancel consultation"
                                disabled={isCardLoading}
                                onClick={() =>
                                  setCancelModalAppointment(appointment)
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-colors cursor-pointer"
                              >
                                <X size={13} strokeWidth={2.5} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${visual.pill}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${visual.dot}`}
                                />
                                {status}
                              </span>

                              {status === "completed" && (
                                <button
                                  onClick={() => setPrescriptionModal(true)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
                                >
                                  <Pill size={11} />
                                  <span>Rx</span>
                                </button>
                              )}

                              
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {/* PAGINATION */}
        {groupedAppointments.total > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90 shadow-2xs">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, groupedAppointments.total)}–
              {Math.min(currentPage * PAGE_SIZE, groupedAppointments.total)} of {groupedAppointments.total} consultations
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                Page {Math.min(currentPage, groupedAppointments.pageCount)} of {groupedAppointments.pageCount}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= groupedAppointments.pageCount}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel Consultation?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action will notify the patient and release the slot.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white">Patient:</strong>{" "}
                {cancelModalAppointment.patient?.fullName ||
                  cancelModalAppointment.patientName ||
                  "Patient"}
              </p>
              <p className="mt-1">
                <strong className="text-slate-900 dark:text-white">Schedule:</strong>{" "}
                {formatDay(cancelModalAppointment.appointmentDate)} at{" "}
                {cancelModalAppointment.startTime || "Scheduled time"}
              </p>
              <p className="mt-1">
                <strong className="text-slate-900 dark:text-white">Reason:</strong>{" "}
                {cancelModalAppointment.reason || "General Consultation"}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-colors cursor-pointer"
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

 

export default DoctorSchedule;