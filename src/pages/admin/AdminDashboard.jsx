import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  UserCheck,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Activity,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

import {
  fetchDashboard,
  fetchAuditLogs,
  approveDoctor,
  rejectDoctor,
} from "../../redux/slice/adminSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboard, auditLogs, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveDoctor(id));
  };

  const handleReject = (id) => {
    const reason = window.prompt("Enter rejection reason for this doctor:");
    if (reason !== null) {
      dispatch(rejectDoctor({ id, reason }));
    }
  };

  const stats = [
    {
      title: "Total Platform Users",
      value: dashboard?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      change: "+12% this month",
    },
    {
      title: "Verified Doctors",
      value: dashboard?.totalDoctors || 0,
      icon: Stethoscope,
      color: "bg-teal-500/10 text-teal-600 border-teal-200",
      change: `${dashboard?.pendingDoctors || 0} pending review`,
      highlight: (dashboard?.pendingDoctors || 0) > 0,
    },
    {
      title: "Registered Patients",
      value: dashboard?.totalPatients || 0,
      icon: UserCheck,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      change: "Active userbase",
    },
    {
      title: "Total Consultations",
      value: dashboard?.totalAppointments || 0,
      icon: CalendarCheck,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      change: `${dashboard?.completedAppointments || 0} completed`,
    },
    {
      title: "Completed Payments",
      value: dashboard?.totalPayments || 0,
      icon: CreditCard,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      change: "Successful transactions",
    },
    {
      title: "Prescriptions Issued",
      value: dashboard?.totalPrescriptions || 0,
      icon: FileText,
      color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
      change: "Digital medical Rx",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#1f363d] to-[#40798c] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#70a9a1] text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={16} /> Platform Command & Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            Healthcare System Overview
          </h1>
          <p className="text-slate-200 text-sm mt-1 max-w-2xl">
            Real-time telemetry, doctor credential verifications, consultation metrics, and audit governance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/doctors"
            className="px-4 py-2.5 bg-[#70a9a1] text-[#1f363d] font-bold text-xs rounded-xl hover:bg-white transition-all shadow-md flex items-center gap-2"
          >
            <Stethoscope size={16} />
            <span>Manage Doctors</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <TrendingUp size={16} />
            <span>Deep Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                stat.highlight
                  ? "border-amber-400/70 ring-2 ring-amber-400/20"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
                  {loading ? "..." : stat.value.toLocaleString()}
                </span>
                <span
                  className={`text-xs font-medium ${
                    stat.highlight ? "text-amber-600 font-bold" : "text-slate-500"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DOCTOR APPROVAL QUEUE & RECENT AUDIT TRAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DOCTOR APPROVAL QUEUE (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-[#40798c]" size={20} />
                  Pending Doctor Verifications
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doctors waiting for license and credential validation
                </p>
              </div>
              <Link
                to="/admin/doctors"
                className="text-xs font-bold text-[#40798c] hover:text-[#1f363d] flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading verification queue...
              </div>
            ) : dashboard?.pendingDoctorList?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.pendingDoctorList.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#70a9a1]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#1f363d] text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {doc.fullName?.charAt(0).toUpperCase() || "D"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {doc.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {doc.email} • {doc.phone || "No phone"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                          Specialties: {doc.specialty || "Medical Practitioner"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(doc._id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(doc._id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  No doctor credential verification requests pending right now.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Security level: High Standard Verification</span>
            <span className="font-semibold text-[#1f363d]">MedCare Compliance</span>
          </div>
        </div>

        {/* RECENT AUDIT TRAIL FEED (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="text-[#40798c]" size={20} />
                Live Audit Stream
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time security logs and system activity
              </p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-[#40798c] hover:text-[#1f363d] flex items-center gap-1"
            >
              Full Log <ExternalLink size={14} />
            </Link>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {auditLogs?.slice(0, 6).map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs"
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg text-white font-bold ${
                    log.action === "approve"
                      ? "bg-emerald-500"
                      : log.action === "reject" || log.action === "delete"
                      ? "bg-rose-500"
                      : log.action === "block"
                      ? "bg-amber-500"
                      : "bg-[#40798c]"
                  }`}
                >
                  <AlertCircle size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 capitalize">
                      {log.action} {log.entity}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 line-clamp-2">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    By: {log.user?.fullName || "System Admin"}
                  </p>
                </div>
              </div>
            ))}

            {(!auditLogs || auditLogs.length === 0) && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No recent audit activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
