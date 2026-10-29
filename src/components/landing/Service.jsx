import  { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Video,
  Activity,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
 
} from "lucide-react";
 export const FeatureCard = ({
  icon,
  title,
  description,
  badge,
  statusText,
  isActive = true,
   children,
  className = "",
  accentColor = "blue",
}) => {
  const accentStyles = {
    blue: {
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      activeSwitch: "bg-blue-600",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      activeSwitch: "bg-emerald-500",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      activeSwitch: "bg-amber-500",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      activeSwitch: "bg-indigo-600",
    },
  };

  const currentAccent = accentStyles[accentColor] || accentStyles.blue;

  return (
    <div
     data-aos="fade-up"
      className={`group relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between bg-white hover:bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md text-slate-800 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${currentAccent.iconBg}`}
          >
            {icon}
          </div>

          <div className="flex items-center gap-3">
            {badge && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200/80">
                {badge}
              </span>
            )}

            <div
              className="grid grid-cols-2 gap-1 p-1 opacity-40 group-hover:opacity-75 transition-opacity"
              title="Module status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        {children && <div className="mt-4">{children}</div>}
      </div>

      <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
          <span className="text-xs font-medium text-slate-500">
            {statusText || (isActive ? "Active Service" : "Standby")}
          </span>
        </div>

        {/* <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggle) onToggle(!isActive);
          }}
          aria-label={`Toggle ${title}`}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive
              ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
              : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button> */}
      </div>
    </div>
  );
};

const Service = () => {
   const [servicesState, setServicesState] = useState({
    assistant: true,
    video: true,
    triage: true,
    records: true,
    scheduling: true,
  });

  const [selectedSlot, setSelectedSlot] = useState("03:30 PM");

  const toggleService = (key) => {
    setServicesState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section
      id="services"
      className="w-full py-16 md:py-24 bg-[#F8FAFC] text-slate-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-[2.4px] font-bold text-blue-600">
              PLATFORM
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Comprehensive Patient Care
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-slate-900">
            One place for every part of care.
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
            Modular. Beautiful. AI-first. Designed to remove friction from patients and clinicians alike.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="w-full lg:flex-1 flex flex-col gap-6">
            <FeatureCard
              accentColor="blue"
              icon={<Bot size={22} strokeWidth={2.2} />}
              title="AI Health Assistant"
              description="24/7 conversational care to answer clinical questions, interpret complex lab reports, and guide immediate next steps."
              badge="Always Available"
              statusText="24/7 AI Online"
              isActive={servicesState.assistant}
              onToggle={() => toggleService("assistant")}
            >
              <div className="flex flex-wrap gap-2 pt-1">
                {["Explain recent lab report", "Medication schedule", "Symptom check"].map((chip) => (
                  <span
                    key={chip}
                    className="text-xs px-3 py-1 rounded-lg border bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </FeatureCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                accentColor="indigo"
                icon={<Video size={22} strokeWidth={2.2} />}
                title="Video Consultations"
                description="Meet your verified doctor from anywhere with high-definition, encrypted visits."
                badge="HD Telehealth"
                statusText="Physicians On-Call"
                isActive={servicesState.video}
                onToggle={() => toggleService("video")}
              >
                <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Clock size={14} className="shrink-0" />
                  <span>Average wait time under 4 minutes</span>
                </div>
              </FeatureCard>

              <FeatureCard
                accentColor="emerald"
                icon={<Activity size={22} strokeWidth={2.2} />}
                title="Symptom Triage"
                description="AI-powered clinical checker suggests urgency levels and indicates when to see a specialist."
                badge="Smart Routing"
                statusText="Instant Assessment"
                isActive={servicesState.triage}
                onToggle={() => toggleService("triage")}
              >
                <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Clinical decision support enabled</span>
                </div>
              </FeatureCard>
            </div>

            <FeatureCard
              accentColor="blue"
              icon={<ShieldCheck size={22} strokeWidth={2.2} />}
              title="Records Vault"
              description="Encrypted medical history, electronic prescriptions, lab panels, and diagnostic imaging stored with military-grade safety."
              badge="HIPAA Compliant"
              statusText="256-Bit Encrypted"
              isActive={servicesState.records}
              onToggle={() => toggleService("records")}
            >
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Lock size={13} className="text-emerald-600" />
                  Zero-Knowledge Storage
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Sparkles size={13} className="text-blue-600" />
                  Auto-sync across clinics
                </span>
              </div>
            </FeatureCard>
          </div>

          <div className="w-full lg:w-[32%] flex flex-col">
            <FeatureCard
              accentColor="amber"
              icon={<Calendar size={22} strokeWidth={2.2} />}
              title="Smart Scheduling"
              description="Effortless booking with real-time doctor availability and automated calendar reminders."
              badge="Instant Booking"
              statusText="Live Sync"
              isActive={servicesState.scheduling}
              onToggle={() => toggleService("scheduling")}
              className="h-full justify-between"
            >
              <div className="mt-4 p-4 rounded-xl border bg-amber-50/50 border-amber-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-700">
                    Today's Available Slots
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">● Real-Time</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["09:00 AM", "11:30 AM", "03:30 PM", "05:00 PM"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium text-center transition-all cursor-pointer border ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 text-[11px] flex items-center justify-between text-slate-600">
                  <span>Selected: <strong className="text-slate-900 font-semibold">{selectedSlot}</strong></span>
                  <span className="text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer">
                    <Link to="/login" > Book <ArrowUpRight size={12} /> </Link>   
                  </span>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Service;
