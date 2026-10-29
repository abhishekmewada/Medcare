import { useEffect, useState, useRef, useCallback } from "react";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
   Stethoscope,
  ArrowUpRight,
   HeartPulse,
  Pill,
   Video,
  ShieldCheck,
 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyAppointments } from "../../redux/slice/appointmentSlice";
import { useAppointment } from "../../context/AppointmentContext";

const Appointments = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const dispatch = useDispatch();

  const {
    appointments,
    loading,
    loadingMore,
    error,
    hasMore,
    counts,
  } = useSelector((state) => state.appointment || {});

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch page 1 when filter or debounced search changes
  useEffect(() => {
    setPage(1);
    dispatch(
      fetchMyAppointments({
        page: 1,
        limit: 10,
        status: activeFilter,
        search: debouncedSearch,
      })
    );
  }, [dispatch, activeFilter, debouncedSearch]);

  // Load next batch on scroll
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(
      fetchMyAppointments({
        page: nextPage,
        limit: 10,
        status: activeFilter,
        search: debouncedSearch,
      })
    ).finally(() => {
      isFetchingRef.current = false;
    });
  }, [dispatch, loading, loadingMore, hasMore, page, activeFilter, debouncedSearch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  const { openBookVisit, selectAppointment } = useAppointment();

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const isUpcomingAppointment = (status) =>
    ["pending", "confirmed"].includes(status?.toLowerCase());

  const isCancelledAppointment = (status) =>
    ["cancelled", "rejected"].includes(status?.toLowerCase());

  const filteredAppointments = safeAppointments.filter((apt) => {
    const status = apt.status?.toLowerCase() || "";
    let matchesFilter = true;
    if (activeFilter === "Upcoming") {
      matchesFilter = isUpcomingAppointment(status);
    } else if (activeFilter === "Completed") {
      matchesFilter = status === "completed";
    } else if (activeFilter === "Cancelled") {
      matchesFilter = isCancelledAppointment(status);
    }

    const doctorName =
      apt.doctor?.user?.fullName || apt.doctor?.fullName || "Doctor";
    const doctorSpecialty =
      apt.doctor?.specialization?.name ||
      apt.doctor?.specialty ||
      apt.doctor?.specialization ||
      "";
    const reason = apt.reason || "";
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      doctorName.toLowerCase().includes(search) ||
      String(doctorSpecialty).toLowerCase().includes(search) ||
      reason.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const filters = ["All", "Upcoming", "Completed", "Cancelled"];

  const getFilterCount = (filter) => {
    if (counts && counts[filter] !== undefined) {
      return counts[filter];
    }
    if (filter === "All") return safeAppointments.length;
    if (filter === "Upcoming") {
      return safeAppointments.filter((apt) => isUpcomingAppointment(apt.status)).length;
    }
    if (filter === "Completed") {
      return safeAppointments.filter((apt) => apt.status?.toLowerCase() === "completed").length;
    }
    if (filter === "Cancelled") {
      return safeAppointments.filter((apt) => isCancelledAppointment(apt.status)).length;
    }
    return 0;
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status, isCancelled, isCompleted) => {
    if (isCancelled) {
      return {
        badge: "bg-rose-50 text-rose-700 border border-rose-200/80",
        dot: "bg-rose-500",
      };
    }
    if (isCompleted) {
      return {
        badge: "bg-[#DDF4EC] text-[#285943] border border-[#77af9c]/40",
        dot: "bg-[#285943]",
      };
    }
    if (status === "confirmed") {
      return {
        badge: "bg-[#E6F8F0] text-[#285943] border border-[#8cd790]/60",
        dot: "bg-[#77af9c]",
      };
    }
    return {
      badge: "bg-amber-50 text-amber-800 border border-amber-200/80",
      dot: "bg-amber-500",
    };
  };

  // Next imminent visit for hero callout
  // const upcomingVisits = safeAppointments.filter((a) => isUpcomingAppointment(a.status));
  // const nextVisit = upcomingVisits[0] || null;

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8">
      
      {/* ── 1. EDITORIAL HEADER (CareSync Style) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-stone-200/60 pb-6">
        <div  data-aos="fade-right" className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
            <Calendar className="h-3.5 w-3.5 text-[#77af9c]" />
            <span>Consultation Schedule</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{(counts?.All ?? safeAppointments.length)} total visits recorded</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]">
            Manage your{" "}
            <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900 shadow-2xs">
              scheduled
            </span>{" "}
            care &amp;{" "}
            <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
              visits.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Keep track of doctor consultations, join virtual sessions, and prepare your health records ahead of time.
          </p>
        </div>

        {/* Action Button & Orange Circular Trigger */}
        <div  data-aos="fade-left" className="flex items-center gap-3">
          <button
            type="button"
            onClick={openBookVisit}
            className="inline-flex items-center gap-2 rounded-full bg-[#285943] px-5 py-3 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#1e4533] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Book New Visit</span>
          </button>

          <button
            type="button"
            onClick={openBookVisit}
            title="Book an appointment"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FA6432] text-white shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── 2. PATIENT ADVICE & CLINICAL PREPARATION BENTO ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Advice Card 1: Symptoms */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              advice • 01
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Document Key Symptoms</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Note when symptoms began, their frequency, and any pain triggers so your physician can accurately diagnose early.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#285943]">
            <span>Tip: Track daily severity</span>
          </div>
        </div>

        {/* Advice Card 2: Medications */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              advice • 02
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Current Medications &amp; Allergies</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Have your active prescription dosages and supplement names accessible to prevent adverse interactions.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#285943]">
            <span>Tip: Check refill requirements</span>
          </div>
        </div>

        {/* Advice Card 3: Punctuality & Vitals */}
        <div className="rounded-[24px] border border-stone-200/80 bg-[#E8F4F0]/60 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between border-[#77af9c]/40">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[#77af9c]/30 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#285943]">
              advice • 03
            </span>
            <div className="h-8 w-8 rounded-full bg-[#285943] text-white flex items-center justify-center">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Join 5 Minutes Ahead</h4>
            <p className="mt-1 text-xs text-[#285943]/80 leading-relaxed">
              For telehealth calls, verify camera/mic access in advance. For clinic visits, bring government identification.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#77af9c]/20 flex items-center gap-1.5 text-[11px] font-semibold text-[#285943]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>End-to-end encrypted room</span>
          </div>
        </div>
      </div>

<div className="space-y-8">
  {/* FILTER TABS & SEARCH */}
  <div className="sticky top-24 z-40 flex flex-col gap-3 rounded-[26px] border border-stone-200/90 bg-white p-3 shadow-[0_10px_35px_-12px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
    {/* Filter Chips */}
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const count = getFilterCount(filter);
        const isActive = activeFilter === filter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#285943] text-white shadow-sm"
                : "bg-[#F7F8F5] text-stone-600 hover:bg-[#EBF7F2] hover:text-[#285943]"
            }`}
          >
            <span>{filter}</span>

            <span
              className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                isActive
                  ? "bg-[#DDF4EC] text-[#285943]"
                  : "border border-stone-200 bg-white text-stone-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>

    {/* Search Input */}
    <div className="relative w-full sm:w-72">
      <Search
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
      />

      <input
        type="text"
        placeholder="Search physician or specialty..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-full border border-stone-200 bg-[#F9FAF8] py-2 pl-9 pr-4 text-xs text-slate-800 outline-none transition-all placeholder:text-stone-400 focus:border-[#77af9c] focus:bg-white focus:ring-2 focus:ring-[#77af9c]/20"
      />
    </div>
  </div>

  {/* APPOINTMENT CARDS */}
  {loading && safeAppointments.length === 0 ? (
    <div className="flex min-h-[300px] flex-col items-center justify-center py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#285943] border-t-transparent" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#285943]">
        Loading consultation schedule...
      </p>
    </div>
  ) : error && safeAppointments.length === 0 ? (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
      <span>Failed to load appointments: {error}</span>
    </div>
  ) : (
    <div className="space-y-4">
      {filteredAppointments.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF7F2] text-[#285943]">
            <Stethoscope size={28} strokeWidth={1.8} />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            No appointments in this category
          </h3>

          <p className="mx-auto mb-6 mt-1 max-w-sm text-xs text-stone-500">
            There are currently no records matching your selected filter.
            Schedule a new consultation with certified medical specialists.
          </p>

          <button
            type="button"
            onClick={openBookVisit}
            className="inline-flex items-center gap-2 rounded-full bg-[#FA6432] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-[#e45222]"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Schedule Consultation</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredAppointments.map((apt) => {
            const status = apt.status?.toLowerCase() || "";
            const isCancelled = isCancelledAppointment(status);
            const isCompleted = status === "completed";
            const appointmentId = apt._id || apt.id;

            const doctorName =
              apt.doctor?.user?.fullName ||
              apt.doctor?.fullName ||
              "Doctor";

            const doctorSpecialty =
              apt.doctor?.specialization?.name ||
              apt.doctor?.specialty ||
              apt.doctor?.specialization ||
              "";

            const avatarLetter =
              doctorName.replace("Dr. ", "").charAt(0).toUpperCase() || "D";

            const appointmentDate = formatDate(apt.appointmentDate);

            const appointmentTime = apt.startTime
              ? `${apt.startTime}${
                  apt.endTime ? ` - ${apt.endTime}` : ""
                }`
              : "Time unavailable";

            const statusCfg = getStatusConfig(
              status,
              isCancelled,
              isCompleted
            );

            return (
              <div
                data-aos="fade-up"
                key={appointmentId}
                onClick={() => selectAppointment(apt)}
                className="group flex cursor-pointer flex-col justify-between rounded-[26px] border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#77af9c]/60 hover:shadow-md sm:p-6"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`}
                        />

                        {isCancelled && <AlertCircle size={9} />}
                        {isCompleted && <CheckCircle2 size={9} />}
                        {!isCancelled && !isCompleted && <Clock size={9} />}

                        {formatStatus(status)}
                      </span>

                      <span className="text-[11px] font-medium text-stone-400">
                        • In-Clinic / Virtual
                      </span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition-all group-hover:border-[#285943] group-hover:bg-[#285943] group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F2EC] text-base font-bold text-[#285943] shadow-sm">
                      {avatarLetter}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#285943]">
                        {doctorName}
                      </h3>

                      {doctorSpecialty && (
                        <p className="text-xs font-semibold text-[#77af9c]">
                          {doctorSpecialty}
                        </p>
                      )}

                      <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                        <span className="font-medium text-stone-600">
                          Reason:
                        </span>{" "}
                        {apt.reason || "Standard clinical review"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-[#77af9c]" />
                    <span>{appointmentDate}</span>

                    <span className="text-stone-300">•</span>

                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#77af9c]" />
                    <span>{appointmentTime}</span>
                  </div>

                  <span className="shrink-0 text-xs font-bold text-[#285943] group-hover:underline">
                    Details &gt;
                  </span>
                </div>
              </div>
            );
          })}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

          {/* Loading more batch indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-6 text-stone-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#285943] border-t-transparent" />
              <span className="ml-3 text-xs font-semibold text-[#285943]">
                Loading more visits...
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )}
</div>
      {/* ── 5. SECURITY & COMPLIANCE FOOTER ── */}
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white/70 px-5 py-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
          <span>All appointment records are protected under clinical confidentiality and HIPAA safeguards.</span>
        </div>
        <button
          type="button"
          onClick={openBookVisit}
          className="text-xs font-bold text-[#285943] hover:underline hidden sm:inline"
        >
          Need urgent care? Click here
        </button>
      </div>

    </div>
  );
};

export default Appointments;