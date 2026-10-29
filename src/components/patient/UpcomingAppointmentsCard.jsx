import {
  Clock,
  MapPin,
  ChevronRight,
  Video,
  CalendarDays,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../../context/AppointmentContext";

const UpcomingAppointmentsCard = () => {
  const navigate = useNavigate();

  const appointments = useSelector(
    (state) =>
      state.appointment?.appointments ||
      state.appointments?.appointments ||
      []
  );

  const { selectAppointment } = useAppointment();

  const upcomingAppointments = appointments
    .filter((appointment) =>
      ["pending", "confirmed", "upcoming"].includes(
        appointment.status?.toLowerCase()
      )
    )
    .slice(0, 3);

  const handleViewAll = () => {
    navigate("/patient/appointments");
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Upcoming Consultations
            </h2>

            {upcomingAppointments.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 tabular-nums">
                {upcomingAppointments.length}
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-slate-500">
            Next scheduled visits with your healthcare team
          </p>
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <span>View schedule</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Appointment Feed */}
      <div className="mt-4">
        {upcomingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-2xs">
              <CalendarDays className="h-5 w-5" />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-800">
              No upcoming consultations
            </p>

            <p className="mt-1 max-w-xs text-[11px] text-slate-500">
              Schedule an in-person or virtual consultation with a verified medical specialist.
            </p>

            <button
              type="button"
              onClick={() => navigate("/patient/doctors")}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
            >
              Book a visit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.map((appointment) => {
              const doctorName =
                appointment.doctor?.user?.fullName ||
                appointment.doctor?.fullName ||
                appointment.doctorName ||
                "Primary Physician";

              const doctorSpecialty =
                appointment.doctor?.specialty ||
                appointment.doctor?.user?.specialty ||
                appointment.doctorSpecialty ||
                appointment.specialty ||
                "General Medicine";

              const dateObj = appointment.appointmentDate
                ? new Date(appointment.appointmentDate)
                : appointment.date
                ? new Date(appointment.date)
                : null;

              const month =
                dateObj && !isNaN(dateObj.getTime())
                  ? dateObj
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()
                  : "CAL";

              const dayNumber =
                dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.getDate()
                  : "--";

              const weekday =
                dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString("en-US", { weekday: "short" })
                  : "";

              const isConfirmed =
                appointment.status?.toLowerCase() === "confirmed";

              return (
                <button
                  key={appointment._id || appointment.id}
                  type="button"
                  onClick={() => selectAppointment(appointment)}
                  className="group -mx-2 flex w-full items-center gap-4 rounded-xl px-2.5 py-3 text-left transition-colors first:pt-1 last:pb-1 hover:bg-slate-50/80"
                >
                  {/* Calendar Date Block */}
                  <div className="flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-center shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none">
                      {month}
                    </span>
                    <span className="mt-0.5 text-base font-bold text-slate-900 tabular-nums leading-none">
                      {dayNumber}
                    </span>
                    <span className="mt-0.5 text-[9px] font-medium text-slate-400 leading-none">
                      {weekday}
                    </span>
                  </div>

                  {/* Consultation Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                        {doctorName.startsWith("Dr.")
                          ? doctorName
                          : `Dr. ${doctorName}`}
                      </h3>

                      {/* Status Tag */}
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                          isConfirmed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-amber-50 text-amber-700 border-amber-200/60"
                        }`}
                      >
                        {isConfirmed ? "Confirmed" : "Pending"}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {doctorSpecialty}
                    </p>

                    {/* Metadata Row */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {appointment.startTime ||
                          appointment.time ||
                          "Time TBD"}
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="inline-flex items-center gap-1">
                        {appointment.appointmentType === "video" ||
                        appointment.type === "virtual" ? (
                          <>
                            <Video className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-blue-700">
                              Telehealth
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>In-Clinic Visit</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Subtle Forward Arrow */}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsCard;