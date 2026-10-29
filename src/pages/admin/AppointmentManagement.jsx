import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Eye,
  X,
  CreditCard,
} from "lucide-react";

import { fetchAllAppointments } from "../../redux/slice/adminSlice";

export default function AppointmentManagement() {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    dispatch(fetchAllAppointments());
  }, [dispatch]);

  const filteredAppointments = appointments.filter((app) => {
    const patientName = app.patient?.fullName?.toLowerCase() || "";
    const doctorName = app.doctor?.user?.fullName?.toLowerCase() || "";
    const reason = app.reason?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(search) ||
      doctorName.includes(search) ||
      reason.includes(search);

    if (!matchesSearch) return false;

    if (activeTab !== "all") {
      return app.status === activeTab;
    }

    return true;
  });

  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;
  const noShowCount = appointments.filter((a) => a.status === "no-show").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-[#40798c]" size={28} />
            Global Appointment Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of patient-doctor consultations, status history, and schedule telemetry.
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#1f363d] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "scheduled"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "cancelled"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
          <button
            onClick={() => setActiveTab("no-show")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "no-show"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            No-Show ({noShowCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, doctor, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c]"
          />
        </div>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-4">Attending Doctor</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading appointments registry...
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {app.patient?.fullName?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {app.patient?.fullName || "Patient"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {app.patient?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Stethoscope size={13} className="text-[#40798c]" />
                        {app.doctor?.user?.fullName || "Doctor"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {app.doctor?.specialty || "General Medicine"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        {app.timeSlot || "Time Slot"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {app.status === "completed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      )}
                      {app.status === "scheduled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          <Clock size={12} /> Scheduled
                        </span>
                      )}
                      {app.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <XCircle size={12} /> Cancelled
                        </span>
                      )}
                      {app.status === "no-show" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle size={12} /> No-Show
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedAppointment(app)}
                        className="p-1.5 text-slate-500 hover:text-[#40798c] hover:bg-slate-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No appointments match the filter settings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Appointment Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Patient</p>
                <p className="font-bold text-slate-900">
                  {selectedAppointment.patient?.fullName} ({selectedAppointment.patient?.email})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Doctor</p>
                <p className="font-bold text-slate-900">
                  {selectedAppointment.doctor?.user?.fullName} ({selectedAppointment.doctor?.specialty})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Reason for Visit</p>
                <p className="text-slate-700">
                  {selectedAppointment.reason || "General Medical Checkup"}
                </p>
              </div>

              {selectedAppointment.cancellationReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                  <p className="text-rose-700 text-[10px] uppercase font-bold">Cancellation Reason</p>
                  <p className="text-rose-900">
                    {selectedAppointment.cancellationReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
