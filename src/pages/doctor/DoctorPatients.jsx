import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Mail,
  CalendarDays,
  Phone,
  Pill,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  UserCheck,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";

import EmptyState from "../../components/ui/EmptyState";
import { fetchDoctorAppointments } from "../../redux/slice/appointmentSlice";

// ==========================================
// DATE FORMATTING HELPERS
// ==========================================

const formatDate = (date) => {
  if (!date) return "No visit yet";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No visit yet";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateStr);
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";
};

import { getImageUrl } from "../../utiles/imageURL";
const getAvatarUrl = getImageUrl; // alias for backward compatibility

// ==========================================
// COMPONENT
// ==========================================

const DoctorPatients = () => {
  const dispatch = useDispatch();

  const { appointments = [], loading } = useSelector(
    (state) => state.appointment
  );

  // Search & Filter State
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'visits' | 'name'
  const [patientTypeFilter, setPatientTypeFilter] = useState("all"); // 'all' | 'recurring' | 'new'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 9 : 10;

  // Selected patient for clinical profile modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  // ==========================================
  // CREATE UNIQUE PATIENTS FROM APPOINTMENTS
  // (Preserves exact data logic)
  // ==========================================

  const patients = useMemo(() => {
    const patientMap = {};

    appointments?.forEach((appointment) => {
      const patient = appointment.patient;
      if (!patient?._id) return;

      const patientId = patient._id;

      if (!patientMap[patientId]) {
        patientMap[patientId] = {
          _id: patientId,
          name: patient.fullName || "Unknown Patient",
          email: patient.email || "",
          phone: patient.phone || "",
          avatar: patient.avatar || null,
          visits: 0,
          lastVisit: appointment.appointmentDate,
          history: [],
        };
      }

      // Count visits & collect appointment history
      patientMap[patientId].visits += 1;
      patientMap[patientId].history.push(appointment);

      // Latest appointment comparison
      if (
        new Date(appointment.appointmentDate) >
        new Date(patientMap[patientId].lastVisit)
      ) {
        patientMap[patientId].lastVisit = appointment.appointmentDate;
      }
    });

    return Object.values(patientMap);
  }, [appointments]);

  // ==========================================
  // SEARCH & FILTER PATIENTS
  // ==========================================

  const filteredPatients = useMemo(() => {
    const search = query.trim().toLowerCase();

    const list = patients.filter((patient) => {
      // Search match
      const matchesSearch =
        !search ||
        patient.name?.toLowerCase().includes(search) ||
        patient.email?.toLowerCase().includes(search) ||
        patient.phone?.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Filter by patient type
      if (patientTypeFilter === "recurring" && patient.visits < 2) return false;
      if (patientTypeFilter === "new" && patient.visits !== 1) return false;

      return true;
    });

    // Sort order
    return [...list].sort((a, b) => {
      if (sortBy === "visits") {
        return b.visits - a.visits;
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // Default: recent visit
      return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
    });
  }, [patients, query, patientTypeFilter, sortBy]);

  const handleQueryChange = (val) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handlePatientTypeFilterChange = (val) => {
    setPatientTypeFilter(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleViewModeChange = (val) => {
    setViewMode(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQuery("");
    setPatientTypeFilter("all");
    setSortBy("recent");
    setCurrentPage(1);
  };

  // ==========================================
  // PAGINATION CALCULATIONS
  // ==========================================

  const totalPatients = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPatients = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, safeCurrentPage, itemsPerPage]);

  const startIndex = totalPatients === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safeCurrentPage * itemsPerPage, totalPatients);

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  // ==========================================
  // DIRECTORY STATS
  // ==========================================

  const directoryStats = useMemo(() => {
    const total = patients.length;
    const recurring = patients.filter((p) => p.visits > 1).length;
    const newPatients = patients.filter((p) => p.visits === 1).length;
    const totalVisits = patients.reduce((acc, p) => acc + p.visits, 0);

    return {
      total,
      recurring,
      newPatients,
      avgVisits: total > 0 ? (totalVisits / total).toFixed(1) : 0,
    };
  }, [patients]);

  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-slate-50 via-teal-50/20 to-slate-100/70 text-slate-800 antialiased pt-24 sm:pt-28 pb-16 sm:pb-20 selection:bg-emerald-500/20">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 right-10 h-125 w-125 rounded-full bg-emerald-400/10 blur-[130px]" />
        <div className="absolute top-1/3 -left-36 h-115 w-115 rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
        {/* ==================================================== */}
        {/* 1. EXECUTIVE HEADER BANNER                           */}
        {/* ==================================================== */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-xl shadow-xs transition-all duration-300 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-linear-to-br from-emerald-400/20 via-teal-300/15 to-transparent blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/15 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
                <Users size={13} className="text-emerald-600" />
                <span className="tracking-wide">Patient Registry</span>
                <span className="text-emerald-300">•</span>
                <span className="font-normal text-slate-500">
                  {directoryStats.total} Unique Patients
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Patient Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Browse clinical records, review visit frequencies, and issue direct pharmacotherapy prescriptions.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch(fetchDoctorAppointments())}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 active:scale-95"
                title="Refresh directory"
              >
                <RefreshCw size={14} className={`text-emerald-600 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <Link
                to="/doctor/prescriptions"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-700/20 transition-all hover:bg-teal-800 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <Pill size={14} className="text-teal-200" />
                <span>Write Prescription</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. DIRECTORY KPI METRICS                             */}
        {/* ==================================================== */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-md shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Patients
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {directoryStats.total}
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                Registered
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-md shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Returning Patients
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <UserCheck size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {directoryStats.recurring}
              </span>
              <span className="text-[11px] font-medium text-teal-600">
                2+ Consultations
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-md shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                New Patients
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CalendarDays size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {directoryStats.newPatients}
              </span>
              <span className="text-[11px] font-medium text-blue-600">
                1st Visit
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-4.5 backdrop-blur-md shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg Visits/Patient
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {directoryStats.avgVisits}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Consultations
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. CONTROL STRIP (Search, Filters, Sort & View Mode) */}
        {/* ==================================================== */}
        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xl shadow-2xs sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search by patient name, email, or phone number..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Pills & Sorting */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-1">
                {[
                  { id: "all", label: "All" },
                  { id: "recurring", label: "Returning (2+)" },
                  { id: "new", label: "New (1)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePatientTypeFilterChange(item.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      patientTypeFilter === item.id
                        ? "bg-teal-700 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
                <SlidersHorizontal size={13} className="text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortByChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="recent">Recent Visit</option>
                  <option value="visits">Most Consultations</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-1">
                <button
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                  className={`rounded-xl p-1.5 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange("table")}
                  className={`rounded-xl p-1.5 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Table / List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators & Count */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{startIndex} - {endIndex}</strong> of{" "}
              <strong className="text-slate-800">{totalPatients}</strong> patients
              {query && ` matching "${query}"`}
            </span>

            {(query || patientTypeFilter !== "all" || sortBy !== "recent") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. LOADING STATE                                     */}
        {/* ==================================================== */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 py-20 backdrop-blur-md shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Loader2 className="h-7 w-7 animate-spin text-teal-800" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Loading Patient Directory
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Aggregating patient visit histories and profiles...
            </p>
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. EMPTY STATE                                       */}
        {/* ==================================================== */}
        {!loading && totalPatients === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-emerald-800/15 bg-white/80 p-12 text-center backdrop-blur-md shadow-xs">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <Users size={26} strokeWidth={2} />
            </div>
            <EmptyState
              icon={Users}
              title={query ? "No patients matching your search" : "No patients found"}
              description={
                query
                  ? "Try searching by a different name, email, or telephone number."
                  : "When you hold consultations with patients, their unified profiles will appear here."
              }
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Clear search query
              </button>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 6. PATIENT CARDS: GRID VIEW                          */}
        {/* ==================================================== */}
        {!loading && totalPatients > 0 && viewMode === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPatients.map((patient) => {
              const avatarSrc = getAvatarUrl(patient.avatar);
              const initials = getInitials(patient.name);

              return (
                <div
                  key={patient._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                >
                  <div>
                    {/* Header: Avatar, Name & Visit Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-teal-700 to-teal-800 text-sm font-bold text-white shadow-2xs">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={patient.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>

                        {/* Name & Patient Type */}
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-slate-900 transition-colors group-hover:text-emerald-700">
                            {patient.name}
                          </h3>
                          <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {patient.visits > 1 ? "Recurring" : "New Patient"}
                          </span>
                        </div>
                      </div>

                      {/* Visit Count Badge */}
                      <span className="shrink-0 rounded-full border border-emerald-600/20 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {patient.visits} {patient.visits === 1 ? "Visit" : "Visits"}
                      </span>
                    </div>

                    {/* Contact & Detail Section */}
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                      {patient.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}

                      {patient.phone ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{patient.phone}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Phone size={13} className="shrink-0" />
                          <span>No phone recorded</span>
                        </div>
                      )}
                    </div>

                    {/* Clinical Summary Bar */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/80 p-2.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Last Consultation
                        </span>
                        <p className="text-xs font-bold text-slate-800">
                          {formatDate(patient.lastVisit)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Activity
                        </span>
                        <p className="text-xs font-medium text-emerald-700">
                          {getRelativeTime(patient.lastVisit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(patient)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700"
                    >
                      <FileText size={13} />
                      <span>History ({patient.history?.length || 0})</span>
                    </button>

                    <Link
                      to="/doctor/prescriptions"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      <Pill size={12} />
                      <span>Issue Rx</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================================================== */}
        {/* 7. PATIENT ROWS: TABLE / LIST VIEW                   */}
        {/* ==================================================== */}
        {!loading && totalPatients > 0 && viewMode === "table" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Consultations</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPatients.map((patient) => {
                    const avatarSrc = getAvatarUrl(patient.avatar);
                    const initials = getInitials(patient.name);

                    return (
                      <tr
                        key={patient._id}
                        className="transition-colors hover:bg-emerald-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-teal-700 to-teal-800 text-xs font-bold text-white shadow-2xs">
                              {avatarSrc ? (
                                <img
                                  src={avatarSrc}
                                  alt={patient.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {patient.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {patient.visits > 1 ? "Recurring Patient" : "New Patient"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-slate-700">
                              {patient.email || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {patient.phone || "No phone"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            {patient.visits} {patient.visits === 1 ? "consultation" : "consultations"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {formatDate(patient.lastVisit)}
                            </p>
                            <span className="text-[10px] text-emerald-600">
                              {getRelativeTime(patient.lastVisit)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPatient(patient)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              History
                            </button>
                            <Link
                              to="/doctor/prescriptions"
                              className="rounded-xl bg-teal-700 px-3 py-1.5 font-bold text-white shadow-2xs transition hover:bg-teal-800"
                            >
                              Rx
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 8. PAGINATION BAR                                    */}
        {/* ==================================================== */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xl shadow-2xs sm:flex-row sm:px-6">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-800">{safeCurrentPage}</strong> of{" "}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    );
                  }

                  const isCurrent = p === safeCurrentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`h-9 min-w-9 rounded-xl text-xs font-bold transition ${
                        isCurrent
                          ? "bg-teal-700 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 9. PATIENT CONSULTATION HISTORY MODAL                */}
      {/* ==================================================== */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-teal-700 to-teal-800 text-sm font-bold text-white shadow-2xs">
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedPatient.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedPatient.email || "No email"}</span>
                    <span>•</span>
                    <span>{selectedPatient.phone || "No phone"}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Consultation Timeline */}
            <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consultation History ({selectedPatient.history?.length || 0})
              </h4>

              {selectedPatient.history?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No recorded consultations for this patient.
                </p>
              ) : (
                selectedPatient.history?.map((apt, idx) => (
                  <div
                    key={apt._id || idx}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-600" />
                        {formatDate(apt.appointmentDate)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold capitalize text-emerald-800">
                        {apt.status || "completed"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} className="text-slate-400" />
                        {apt.startTime || "--:--"} {apt.endTime ? `to ${apt.endTime}` : ""}
                      </span>

                      <span className="truncate max-w-50 text-[11px] font-medium text-slate-500">
                        Reason: {apt.reason || "General Consultation"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-400">
                Total Visits: <strong>{selectedPatient.visits}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  to="/doctor/prescriptions"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-800"
                >
                  <Pill size={13} />
                  <span>Write Prescription</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;