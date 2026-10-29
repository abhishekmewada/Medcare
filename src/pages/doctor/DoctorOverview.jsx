import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Users,
  Activity,
  IndianRupee,
  Eye,
  ArrowRight,
  Clock3,
  CheckCircle2,
  X,
  ArrowUpRight,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { saveWeeklyAvailability } from "../../redux/slice/availabilitySlice";
import { fetchDoctorDashboard } from "../../redux/slice/doctorDashboardSlice";
 

const DoctorOverview = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading: availabilityLoading } = useSelector((state) => state.availability);
  const {
    stats,
    upcomingAppointments = [],
    recentPatients = [],
    loading: dashboardLoading,
  } = useSelector((state) => state.doctorDashboard);

  const [showAvailability, setShowAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [weeklyAvailability, setWeeklyAvailability] = useState(
    days.map((day) => ({
      day,
      enabled: day !== "Sunday",
      slots: [{ startTime: "10:00", endTime: "13:00" }],
    }))
  );

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    AOS.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 60 });
  }, [dispatch]);

  const doctorName = user?.fullName || user?.name || "Doctor";
  const specialty = user?.specialty || "Medical Specialist";
  const completionRate = stats?.completionRate || 92;

  const toggleDay = (day) => {
    setWeeklyAvailability((prev) =>
      prev.map((item) => (item.day === day ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const updateSlot = (day, index, field, value) => {
    setWeeklyAvailability((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
            }
          : item
      )
    );
  };

  const addSlot = (day) => {
    setWeeklyAvailability((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, slots: [...item.slots, { startTime: "14:00", endTime: "17:00" }] }
          : item
      )
    );
  };

  const removeSlot = (day, index) => {
    setWeeklyAvailability((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, slots: item.slots.filter((_, i) => i !== index) }
          : item
      )
    );
  };

  const handleSaveAvailability = async () => {
    try {
      await dispatch(saveWeeklyAvailability(weeklyAvailability)).unwrap();
      setShowAvailability(false);
    } catch (error) {
      console.error("Availability save error:", error);
    }
  };

  const quickActions = [
    { to: "/doctor/schedule", title: "Schedule", desc: "Calendar & slots", icon: CalendarDays },
    { to: "/doctor/patients", title: "Patients", desc: "Vitals & history", icon: Users },
    { to: "/doctor/prescriptions/new", title: "Write Rx", desc: "Digital prescription", icon: Activity },
  ];

  return (
   <div className="relative w-full min-h-screen bg-linear-to-b from-slate-50 via-teal-50/20 to-slate-100/70 py-16 lg:py-24 text-slate-800 antialiased overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none  -top-24 left-1/4 fixed h-196 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-20 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1920px] space-y-8 px-4 sm:px-8 md:px-14 lg:px-20"> 
        
        {/* ── 1. HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-slate-200/80">
          <div className="space-y-4 max-w-3xl">
            <div 
              data-aos="fade-right"
              data-aos-delay="0"
              data-aos-duration="700"
              className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
              <span className="tracking-wide">MedCare Clinical Suite</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{specialty}</span>
            </div>

            <h1
              data-aos="fade-right"
              data-aos-delay="150"
              data-aos-duration="700"
              className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]"
            >
              Manage your{" "}
              <span className="inline-block rounded-full border border-slate-300 bg-white/80 backdrop-blur-sm px-4 py-0.5 font-serif italic text-slate-900 shadow-2xs">
                clinical
              </span>{" "}
              practice &amp;{" "}
              <span className="inline-block rounded-full border border-teal-200 bg-teal-100/80 px-4 py-0.5 font-medium text-teal-900 shadow-2xs">
                consultations.
              </span>
            </h1>

            <p 
              data-aos="fade-right"
              data-aos-delay="300"
              data-aos-duration="700" 
              className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl"
            >
              Welcome back, <strong className="font-semibold text-slate-900">Dr. {doctorName}</strong>. You have{" "}
              <strong className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                {stats?.todayUpcomingAppointments || 0} consultations
              </strong>{" "}
              scheduled for today.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-end">
            <button
              type="button"
              onClick={() => setShowAvailability((prev) => !prev)}
              className={`inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-xs font-semibold bg-white/90 backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${
                isAvailable 
                  ? "border-teal-300 text-teal-800 hover:border-teal-400 hover:bg-teal-50/40" 
                  : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                {isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAvailable ? "bg-teal-600" : "bg-slate-400"}`} />
              </span>
              <span>{isAvailable ? "Accepting Patients" : "Duty Off"}</span>
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <Link
              to="/doctor/schedule"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-teal-600 hover:scale-105 active:scale-95 transition-all duration-200"
              title="View Schedule"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* ── 2. CLINICAL HIGHLIGHT TILES ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          
          {/* Tile 1: Telehealth Desk */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between min-h-60 group">
            <div className="absolute inset-0 z-0">
             {/* <img
src={doctor?.profileImage || "/images/doctorimg.avif"}
alt="Doctor Profile"
className="h-full w-full object-cover object-[center_20%] opacity-25 group-hover:scale-105 transition-transform duration-500"
/> */}

              <div className="absolute inset-0 bg-linear-to-t from-white via-white/85 to-white/40" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full border border-teal-200 bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 shadow-2xs">
                Virtual Care Desk
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Live Station
              </span>
            </div>

            <div className="relative z-10 my-4 max-w-sm">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Telehealth &amp; Outpatient Care
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                End-to-end encrypted video visits, diagnostic uploads, and real-time electronic vitals review.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-[10px] font-semibold tracking-wide">
                HD Video
              </span>
              <span className="rounded-full bg-white/90 border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-700">
                HIPAA Compliant
              </span>
              <Link 
                to="/doctor/schedule" 
                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
              >
                <span>Open Desk</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Tile 2: Clinical Advisory */}
          <div className="lg:col-span-4 rounded-3xl border border-teal-200/80 bg-linear-to-br from-teal-50/80 via-white to-emerald-50/40 p-6 shadow-sm flex flex-col justify-between min-h-60">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  clinical advisory • seasonal
                </span>
                <div className="h-8 w-8 rounded-full bg-teal-100/80 flex items-center justify-center text-teal-700">
                  <HeartPulse className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-lg font-bold text-slate-900 leading-snug">
                  Seasonal Respiratory &amp; Viral Triage
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review recent patient allergy histories and viral symptom progressions before authorizing antibiotic therapy.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-800">Evidence-based Protocol</span>
              <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Tile 3: Performance Metric Ring */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between min-h-60">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Performance
              </span>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-teal-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>

            <div className="my-3 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-600 transition-all duration-1000 ease-out"
                    strokeDasharray={`${completionRate}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{completionRate}%</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">resolved</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 text-center">
              <p className="text-xs font-semibold text-slate-800">{stats?.completedVisits || 0} Visits Completed</p>
              <p className="text-[11px] text-slate-500 mt-0.5">High patient satisfaction index</p>
            </div>
          </div>

        </div>

        {/* ── 3. STAT METRICS BENTO ── */}
        <div 
          data-aos="fade-up"
          data-aos-delay="0"
          data-aos-duration="700"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {/* Card 1 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Visits</span>
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-light tracking-tight text-slate-900">{stats?.totalAppointments || 0}</span>
              <p className="text-[11px] font-medium text-teal-700 mt-1">Cumulative practice volume</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Patients</span>
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-light tracking-tight text-slate-900">{stats?.patientsUnderCare || 0}</span>
              <p className="text-[11px] font-medium text-teal-700 mt-1">Under active monitoring</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-light tracking-tight text-slate-900">{stats?.completedVisits || 0}</span>
              <p className="text-[11px] font-medium text-emerald-700 mt-1">Discharged &amp; resolved</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Practice Revenue</span>
              <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-light tracking-tight text-slate-900">
                ₹{Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] font-medium text-slate-600 mt-1">Settled consultations</p>
            </div>
          </div>
        </div>

        {/* ── 4. APPOINTMENTS TIMELINE & RECENT PATIENTS (8 / 4 Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 Cols) */}
          <div data-aos="fade-right" className="space-y-6 lg:col-span-8">
            
            {/* Upcoming Consultations */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Daily Schedule
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">Today &amp; Upcoming Consultations</h2>
                </div>
                <Link to="/doctor/schedule" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline">
                  <span>Full Schedule</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="py-14 text-center text-xs text-slate-400 animate-pulse">Loading appointments...</div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="py-10 text-center">
                  <EmptyState icon={CalendarDays} title="No upcoming appointments" />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingAppointments.map((apt) => (
                    <div 
                      key={apt._id} 
                      className="flex items-center justify-between gap-4 py-3.5 px-3 hover:bg-slate-50/80 rounded-2xl transition-colors duration-150"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50/80 border border-teal-100/80 px-2 py-1 text-center">
                          <Clock3 size={13} className="text-teal-700 mb-0.5" />
                          <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800">
                            <span>{apt.startTime || "--"}</span>
                            <span className="text-teal-400">-</span>
                            <span>{apt.endTime || "--"}</span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 capitalize truncate">{apt.patient?.fullName || "Patient"}</h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{apt.reason || "General Consultation"}</p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Clinical Registry
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">Recently Examined Patients</h2>
                </div>
                <Link to="/doctor/patients" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline">
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentPatients.length === 0 ? (
                <div className="py-10 text-center">
                  <EmptyState icon={Users} title="No patients yet." />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {recentPatients.slice(0, 3).map((patient) => {
                    const pName = patient.fullName || patient.name || "Patient";
                    const pInitials = pName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const pId = patient._id || patient.id;

                    return (
                      <Link
                        key={pId}
                        to={`/doctor/patients/${pId}`}
                        className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 hover:border-teal-300 hover:bg-white transition-all duration-200 shadow-2xs hover:shadow-xs"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 font-bold text-xs text-teal-800">
                          {pInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-800 transition-colors">{pName}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{patient.lastVisit || "Recent Visit"}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-teal-700 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Workflows (4 Cols) */}
          <div data-aos="fade-left" className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Workflows
              </span>
              <h3 className="text-base font-bold text-slate-900">Clinical Actions</h3>

              <div className="space-y-2.5">
                {quickActions.map(({ to, title, desc, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3.5 hover:border-teal-300 hover:bg-white transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 border border-slate-200/80 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all duration-200">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">{title}</h4>
                        <p className="text-[11px] text-slate-500">{desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-700 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-teal-200/70 bg-teal-50/50 p-4 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-teal-900">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span>Certified MedCare Portal</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All patient medical charts and telehealth channels adhere strictly to encrypted EHR confidentiality protocols.
              </p>
            </div>
          </div>

        </div>

        {/* ── 5. AVAILABILITY MODAL ── */}
        {showAvailability && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowAvailability(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <CalendarDays size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Consultation Availability</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvailability(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`rounded-xl py-2 px-3 text-center text-xs font-semibold transition-all cursor-pointer ${
                    isAvailable 
                      ? "bg-white text-teal-900 shadow-xs border border-teal-200/60 font-bold" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Available Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`rounded-xl py-2 px-3 text-center text-xs font-semibold transition-all cursor-pointer ${
                    !isAvailable 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Duty Off
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {weeklyAvailability.map((item) => (
                  <div key={item.day} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{item.day}</span>
                      <button
                        type="button"
                        onClick={() => toggleDay(item.day)}
                        className={`h-5 w-9 rounded-full relative transition-colors cursor-pointer ${item.enabled ? "bg-teal-600" : "bg-slate-300"}`}
                      >
                        <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-transform ${item.enabled ? "left-4" : "left-0.5"}`} />
                      </button>
                    </div>

                    {item.enabled && (
                      <div className="space-y-1.5 pt-1">
                        {item.slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateSlot(item.day, index, "startTime", e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                            />
                            <span className="text-xs text-slate-400">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateSlot(item.day, index, "endTime", e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                            />
                            {item.slots.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeSlot(item.day, index)} 
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addSlot(item.day)} 
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline pt-0.5"
                        >
                          + Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAvailability(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvailability}
                  disabled={availabilityLoading}
                  className="rounded-full bg-teal-600 hover:bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {availabilityLoading ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorOverview;