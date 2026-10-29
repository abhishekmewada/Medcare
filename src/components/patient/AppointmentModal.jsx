import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
} from "lucide-react";

import { useAppointment } from "../../context/AppointmentContext";

const AppointmentModal = () => {
  const {
    selectedAppointment,
    isAppointmentModalOpen,
    closeAppointmentModal,
  } = useAppointment();

  if (!isAppointmentModalOpen || !selectedAppointment) {
    return null;
  }

  const appointment = selectedAppointment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={closeAppointmentModal}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 p-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Appointment Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your scheduled consultation
            </p>
          </div>

          <button
            onClick={closeAppointmentModal}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-5 p-5">

          {/* Doctor */}

          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600">
              {appointment.doctorName
                ?.replace("Dr. ", "")
                ?.charAt(0)
                ?.toUpperCase() || "D"}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {appointment.doctorName || "Doctor"}
              </h3>

              <p className="text-xs text-slate-500">
                {appointment.doctorSpecialty ||
                  appointment.specialty ||
                  "Medical Specialist"}
              </p>
            </div>

          </div>

          {/* Date */}

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />

            <div>
              <p className="text-xs text-slate-400">
                Date
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {appointment.date || "Not specified"}
              </p>
            </div>
          </div>

          {/* Time */}

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />

            <div>
              <p className="text-xs text-slate-400">
                Time
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {appointment.time || "Not specified"}
              </p>
            </div>
          </div>

          {/* Appointment Type */}

          <div className="flex items-center gap-3">

            {appointment.type === "virtual" ? (
              <Video className="h-5 w-5 text-purple-600" />
            ) : (
              <MapPin className="h-5 w-5 text-emerald-600" />
            )}

            <div>
              <p className="text-xs text-slate-400">
                Appointment Type
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {appointment.type === "virtual"
                  ? "Virtual Consultation"
                  : "In-person Visit"}
              </p>
            </div>

          </div>

          {/* Reason */}

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
              Reason
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {appointment.reason || "Medical consultation"}
            </p>

          </div>

          {/* Status */}

          <div className="flex items-center justify-between">

            <span className="text-xs text-slate-400">
              Status
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {appointment.status}
            </span>

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-slate-100 p-5">

          <button
            onClick={closeAppointmentModal}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default AppointmentModal;