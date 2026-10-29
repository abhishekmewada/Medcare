import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  CalendarDays,
  TrendingUp,
  Users,
  IndianRupee,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import { fetchDoctorAppointments } from "../../redux/slice/appointmentSlice";

// ==========================================
// COLOR PALETTE (Clinical & Enterprise SaaS)
// ==========================================

const COLORS = {
  primary: "#0F766E",      // Deep Teal
  primaryDark: "#115E59",  // Dark Teal
  primaryLight: "#CCFBF1", // Soft Teal
  slateDark: "#0F172A",    // Dark Slate
  slate: "#334155",        // Slate
  slateMuted: "#64748B",   // Muted Slate
  slateBorder: "#E2E8F0",  // Slate Border
  bgSoft: "#F8FAFC",       // Soft Background
  white: "#FFFFFF",        // White
  success: "#15803D",      // Clinical Success
  info: "#0369A1",         // Clinical Info
  warning: "#B45309",      // Clinical Warning
  danger: "#B91C1C",       // Clinical Danger
};

const STATUS_COLORS = {
  Completed: COLORS.primary,
  "Scheduled / Pending": COLORS.info,
  Cancelled: COLORS.danger,
};

// ==========================================
// DATE HELPERS (Preserved Logic)
// ==========================================

// Get last 14 days
const getLast14Days = () => {
  const days = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }

  return days;
};

// ==========================================
// CUSTOM TOOLTIPS (Recharts)
// ==========================================

const VolumeTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-[#0F766E] dark:text-teal-400">
          {payload[0].value} {payload[0].value === 1 ? "Consultation" : "Consultations"}
        </p>
      </div>
    );
  }
  return null;
};

const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {data.name}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
          {data.value} {data.value === 1 ? "Session" : "Sessions"}
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const DoctorAnalytics = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Strictly preserved Redux state selectors (with safe fallback to appointment slice)
  const appointments = useSelector(
    (state) => state.appointments?.items || state.appointment?.appointments || []
  );

  const patients = useSelector(
    (state) => state.patients?.items || []
  );

  // Fetch appointments on load to ensure data is populated
  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchDoctorAppointments()).unwrap();
    } catch (err) {
      console.error("Analytics refresh failed:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // ==========================================
  // STATISTICS (Preserved Calculations)
  // ==========================================

  const stats = useMemo(() => {
    const completedAppointments = appointments.filter(
      (appointment) => appointment.status === "completed"
    );

    const revenue = completedAppointments.reduce(
      (total, appointment) =>
        total + Number(appointment.fee || appointment.fees || 0),
      0
    );

    // If patients slice is empty, safely compute unique patient headcount from appointments
    const patientHeadcount =
      patients.length > 0
        ? patients.length
        : new Set(
            appointments
              .map((a) => a.patient?._id || a.patient)
              .filter(Boolean)
          ).size;

    return {
      total: appointments.length,
      completed: completedAppointments.length,
      patients: patientHeadcount,
      revenue,
    };
  }, [appointments, patients]);

  // ==========================================
  // APPOINTMENT DAILY DATA (Preserved Logic)
  // ==========================================

  const dailyData = useMemo(() => {
    const days = getLast14Days();

    const counts = Object.fromEntries(
      days.map((day) => [day, 0])
    );

    appointments.forEach((appointment) => {
      const aptDate =
        appointment.date ||
        (appointment.appointmentDate
          ? new Date(appointment.appointmentDate).toISOString().slice(0, 10)
          : null);

      if (aptDate && counts[aptDate] !== undefined) {
        counts[aptDate] += 1;
      }
    });

    return days.map((day) => {
      const d = new Date(day);
      const displayDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        date: day.slice(5),
        displayDate,
        count: counts[day],
      };
    });
  }, [appointments]);

  // Peak Day calculation
  const peakDay = useMemo(() => {
    return dailyData.reduce(
      (max, d) => (d.count > max.count ? d : max),
      { count: 0, displayDate: "N/A" }
    );
  }, [dailyData]);

  // ==========================================
  // APPOINTMENT BY TYPE (Preserved Logic)
  // ==========================================

  const byType = useMemo(() => {
    const counts = {};

    appointments.forEach((appointment) => {
      const type = appointment.reason || appointment.appointmentType || "General Consultation";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  // ==========================================
  // STATUS DISTRIBUTION (Derived from Data)
  // ==========================================

  const statusData = useMemo(() => {
    const completed = stats.completed;
    const cancelled = appointments.filter((a) =>
      ["cancelled", "rejected"].includes(a.status?.toLowerCase())
    ).length;
    const pending = appointments.filter((a) =>
      ["pending", "confirmed"].includes(a.status?.toLowerCase())
    ).length;

    const list = [
      { name: "Completed", value: completed, color: STATUS_COLORS.Completed },
      { name: "Scheduled / Pending", value: pending, color: STATUS_COLORS["Scheduled / Pending"] },
      { name: "Cancelled", value: cancelled, color: STATUS_COLORS.Cancelled },
    ];

    return list.filter((item) => item.value > 0);
  }, [appointments, stats.completed]);

  // Rates & Operational Metrics
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const cancellationRate =
    stats.total > 0
      ? Math.round(
          (appointments.filter((a) =>
            ["cancelled", "rejected"].includes(a.status?.toLowerCase())
          ).length /
            stats.total) *
            100
        )
      : 0;
  const avgRevenuePerVisit =
    stats.completed > 0 ? Math.round(stats.revenue / stats.completed) : 0;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] antialiased dark:bg-[#0B1116] dark:text-slate-100 pt-28 md:pt-32 pb-24 selection:bg-teal-500/20">
      <div className="mx-auto w-full max-w-[1920px] space-y-8 px-4 sm:px-8 md:px-14 lg:px-20">
        {/* ==================================================== */}
        {/* 1. HEADER / PAGE INTRODUCTION                        */}
        {/* ==================================================== */}
        <div className="flex flex-col justify-between gap-6 pb-2 border-b border-slate-200/80 md:flex-row md:items-end dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-[#CCFBF1]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:border-teal-500/20 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E] dark:bg-teal-400" />
              <span>Clinical Analytics</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              Analytics &amp; Performance
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-2xl">
              Monitor your practice volume, patient consultation flow, and clinical throughput over a rolling 14-day window.
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#64748B] shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <Clock size={13} className="text-[#0F766E]" />
              <span>14-Day Rolling Window</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-2xs transition-all hover:border-teal-300 hover:text-[#0F766E] active:scale-95 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              title="Refresh Analytics"
            >
              <RefreshCw
                size={13}
                className={`text-[#0F766E] dark:text-teal-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. KPI / PERFORMANCE SUMMARY                         */}
        {/* ==================================================== */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-5">
          {/* Card 1: Total Appointments (Deep Teal Highlight) */}
          <div className="relative overflow-hidden rounded-[20px] border border-teal-800/20 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-teal-500/20 dark:bg-slate-900">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0F766E]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Total Consultations
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CCFBF1]/70 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <CalendarDays size={18} strokeWidth={2.2} />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-medium text-[#64748B] dark:text-slate-400">
              Total volume across records
            </p>
          </div>

          {/* Card 2: Completed Consultations */}
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Completed Visits
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  {stats.completed}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300">
                <TrendingUp size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#15803D] dark:text-emerald-400">
              <span className="font-bold">{completionRate}%</span>
              <span className="text-[#64748B] dark:text-slate-400">completion rate</span>
            </div>
          </div>

          {/* Card 3: Patients Registry */}
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Unique Patients
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  {stats.patients}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#0369A1] dark:bg-sky-950/60 dark:text-sky-300">
                <Users size={18} strokeWidth={2.2} />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-medium text-[#64748B] dark:text-slate-400">
              Registered patient registry
            </p>
          </div>

          {/* Card 4: Revenue */}
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Clinical Revenue
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <IndianRupee size={18} strokeWidth={2.2} />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-medium text-[#64748B] dark:text-slate-400">
              Avg ₹{avgRevenuePerVisit.toLocaleString("en-IN")} / completed visit
            </p>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. MAIN ANALYTICS AREA (Line Trend + Status Donut)   */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Trend Chart (Col 1 - 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-white">
                  Consultation Volume Trend
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Daily patient consultations over the past 14 days
                </p>
              </div>

              {peakDay.count > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200/70 bg-[#CCFBF1]/40 px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <Activity size={12} />
                  <span>Peak: {peakDay.count} on {peakDay.displayDate}</span>
                </div>
              )}
            </div>

            <div className="mt-6 h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<VolumeTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tealGrad)"
                    activeDot={{ r: 5, fill: "#0F766E", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-[#64748B] dark:border-slate-800 dark:text-slate-400">
              <span>Showing last 14 days</span>
              <span className="font-semibold text-[#0F766E] dark:text-teal-400">
                Total: {dailyData.reduce((acc, curr) => acc + curr.count, 0)} Consultations
              </span>
            </div>
          </div>

          {/* Status Donut Distribution (Col 2 - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Consultation Status
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Breakdown of appointments by fulfillment state
              </p>
            </div>

            <div className="my-4 flex items-center justify-center">
              {statusData.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-center text-xs text-[#64748B]">
                  <AlertCircle size={24} className="mb-2 text-slate-300" />
                  <span>No consultation status recorded yet.</span>
                </div>
              ) : (
                <div className="relative h-56 w-full max-w-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Statistic */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-[#0F172A] dark:text-white">
                      {stats.total}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Total Sessions
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Clinical Legend */}
            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {statusData.map((item) => {
                const percentage =
                  stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-[#334155] dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-[#0F172A] dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. SECONDARY ANALYTICS (Case Mix + Operational)      */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card 1: Clinical Case Mix (By Reason) */}
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  Case Mix &amp; Consultation Reasons
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Distribution of clinical complaints and appointments
                </p>
              </div>
              <FileText size={16} className="text-[#64748B]" />
            </div>

            <div className="mt-4 space-y-3.5">
              {byType.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#64748B]">
                  No consultation category data available.
                </p>
              ) : (
                byType.slice(0, 5).map((item) => {
                  const percent =
                    stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#334155] dark:text-slate-200 truncate max-w-60">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-[#0F172A] dark:text-white">
                            {item.value}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            ({percent}%)
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#0F766E] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 2: Practice Performance Insights */}
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  Practice Efficiency Indicators
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Key operational ratios calculated from real session records
                </p>
              </div>
              <Activity size={16} className="text-[#0F766E]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Metric 1 */}
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <CheckCircle2 size={13} className="text-[#15803D]" />
                  <span>Completion Rate</span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#0F172A] dark:text-white">
                  {completionRate}%
                </p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  {stats.completed} of {stats.total} sessions fulfilled
                </p>
              </div>

              {/* Metric 2 */}
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <AlertCircle size={13} className="text-[#B91C1C]" />
                  <span>Cancellation Rate</span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#0F172A] dark:text-white">
                  {cancellationRate}%
                </p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  Dropped or rescheduled sessions
                </p>
              </div>

              {/* Metric 3 */}
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Clock size={13} className="text-[#0369A1]" />
                  <span>Daily Patient Pace</span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#0F172A] dark:text-white">
                  {(stats.total / 14).toFixed(1)}
                </p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  Avg consultations / day
                </p>
              </div>

              {/* Metric 4 */}
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <IndianRupee size={13} className="text-[#0F766E]" />
                  <span>Realized Revenue</span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#0F766E] dark:text-teal-400">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  Settled clinical fees
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#CCFBF1]/30 px-3.5 py-2 text-xs text-[#0F766E] dark:bg-teal-950/30 dark:text-teal-300">
              <span className="font-medium">Operational Status:</span>
              <span className="font-bold flex items-center gap-1">
                Active &amp; Compliant
                <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalytics;