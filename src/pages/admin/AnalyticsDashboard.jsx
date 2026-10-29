import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

import { fetchAnalytics } from "../../redux/slice/adminSlice";

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const { monthlyConsultations = [], specialtyDistribution = [], statusDistribution = [] } =
    analytics || {};

  const maxMonthly = Math.max(...monthlyConsultations.map((m) => m.count), 1);
  const maxSpecialty = Math.max(...specialtyDistribution.map((s) => s.count), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-[#40798c]" size={28} />
            Platform Analytics & Health Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated consultation volume, doctor specialty distribution, and appointment completion rates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium text-sm bg-white rounded-3xl border border-slate-100">
          Calculating platform analytics telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MONTHLY TRENDS (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-[#40798c]" size={18} />
                    Monthly Consultations Volume
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consultations trend over the past 6 months
                  </p>
                </div>
              </div>

              {monthlyConsultations.length > 0 ? (
                <div className="h-64 flex items-end gap-3 sm:gap-6 pt-8 pb-4 border-b border-slate-100">
                  {monthlyConsultations.map((item, idx) => {
                    const heightPercent = Math.round((item.count / maxMonthly) * 100);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                      >
                        <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </span>
                        <div
                          style={{ height: `${Math.max(heightPercent, 8)}%` }}
                          className="w-full max-w-[36px] bg-gradient-to-t from-[#1f363d] to-[#40798c] rounded-t-xl group-hover:to-[#70a9a1] transition-all shadow-sm"
                        />
                        <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No monthly trend data available yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Data source: MedCare Appointment Aggregator</span>
              <span className="font-semibold text-[#1f363d]">Updated Real-Time</span>
            </div>
          </div>

          {/* SPECIALTY DISTRIBUTION (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="text-[#40798c]" size={18} />
                  Top Doctor Specialties
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of registered doctors by medical field
                </p>
              </div>
            </div>

            {specialtyDistribution.length > 0 ? (
              <div className="space-y-4">
                {specialtyDistribution.map((spec, idx) => {
                  const widthPercent = Math.round((spec.count / maxSpecialty) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {spec.specialty}
                        </span>
                        <span className="font-semibold text-slate-500">
                          {spec.count} Doctors
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(widthPercent, 5)}%` }}
                          className="h-full bg-gradient-to-r from-[#40798c] to-[#70a9a1] rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                No specialty distribution data recorded.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
