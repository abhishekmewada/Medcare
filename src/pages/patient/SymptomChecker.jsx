 import {
  Activity,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Clock,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  PhoneCall,
  Info,
} from "lucide-react";
import { useSymptomChecker } from "../../context/SymptomCheckerContext";

const commonSymptoms = [
  "Knee / Joint Pain",
  "Headache / Migraine",
  "Fever / Chills",
  "Cough / Sore Throat",
  "Fatigue / Mild Lethargy",
  "Stomach / Indigestion",
  "Skin Rash / Itching",
  "Muscle Stiffness",
];

const SymptomCheckerView = () => {
  const {
    selectedSymptoms,
    duration,
    severity,
    analyzed,
    toggleSymptom,
    setDuration,
    setSeverity,
    handleAnalyze,
    handleReset,
  } = useSymptomChecker();

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* ── 1. EDITORIAL HERO HEADER (CareSync Style) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6  border-b border-stone-200/60 pb-6">
        <div data-aos="fade-right" className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
            <HeartPulse className="h-3.5 w-3.5 text-[#77af9c]" />
            <span>Intelligent Clinical Triage</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">24/7 AI-Assisted Assessment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]">
            Guided{" "}
            <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900 shadow-2xs">
              symptom
            </span>{" "}
            evaluation &amp;{" "}
            <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
              triage.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Select your active symptoms to receive verified care recommendations, urgency levels, and specialist suggestions.
          </p>
        </div>

        {/* Quality & Safety Pill */}
        <div className="flex items-center gap-2 self-start lg:self-auto rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
          <span>Evidence-Based Clinical Algorithms</span>
        </div>
      </div>

      {/* ── 2. PRE-ASSESSMENT ADVICE BENTO TILES ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Advice 1 */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              guidance • 01
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Select All Present Symptoms</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Concurrent symptoms help our engine evaluate differential diagnoses and determine if an in-clinic examination is required.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#285943]">
            <span>Tip: Multi-select is supported</span>
          </div>
        </div>

        {/* Advice 2 */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              guidance • 02
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Duration Dictates Urgency</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Acute onset (less than 24 hours) may require rapid triage, whereas chronic symptoms indicate specialized treatment.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#285943]">
            <span>Tip: Be accurate on timelines</span>
          </div>
        </div>

        {/* Advice 3: Red Flags */}
        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-rose-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
              emergency • 03
            </span>
            <div className="h-8 w-8 rounded-full bg-rose-600 text-white flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Critical Red Flags</h4>
            <p className="mt-1 text-xs text-rose-900/80 leading-relaxed">
              For sudden chest constriction, severe shortness of breath, or loss of consciousness, do not triage—seek emergency care immediately.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px] font-bold text-rose-700">
            <span>Emergency Hotline</span>
            <span>102 / 911</span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN EVALUATION & RESULTS BENTO GRID ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        
        {/* INPUT ASSESSMENT FORM (7 Cols) */}
        <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-7">
          
          {/* STEP 1: ACTIVE SYMPTOMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#285943] text-[10px] font-bold text-white">
                  1
                </span>
                <span>Select your active symptoms</span>
              </label>
              <span className="text-[11px] font-medium text-[#77af9c]">
                {selectedSymptoms.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {commonSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 text-left text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? "border-[#77af9c] bg-[#E8F4F0] text-[#285943] shadow-2xs"
                        : "border-stone-200/80 bg-[#FAFBF9] text-stone-700 hover:border-stone-300 hover:bg-white"
                    }`}
                  >
                    <span>{symptom}</span>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-[#285943] bg-[#285943] text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DURATION */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#285943] text-[10px] font-bold text-white">
                2
              </span>
              <span>How long have you experienced these?</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                "Less than 24 hours",
                "1-3 days",
                "1 week",
                "Over 2 weeks",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`rounded-2xl border py-2.5 px-3 text-center text-xs font-semibold transition-all duration-200 ${
                    duration === item
                      ? "border-[#285943] bg-[#285943] text-white shadow-xs"
                      : "border-stone-200 bg-[#FAFBF9] text-stone-600 hover:bg-white hover:border-stone-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: SEVERITY / PAIN LEVEL */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#285943] text-[10px] font-bold text-white">
                3
              </span>
              <span>Severity &amp; Pain Level</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {["Mild", "Moderate", "Severe"].map((item) => {
                const isSelected = severity === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSeverity(item)}
                    className={`rounded-2xl border py-3 px-3 text-center text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? item === "Severe"
                          ? "border-rose-400 bg-rose-50 text-rose-700 shadow-2xs"
                          : item === "Moderate"
                          ? "border-amber-400 bg-amber-50 text-amber-800 shadow-2xs"
                          : "border-[#8cd790] bg-[#DDF4EC] text-[#285943] shadow-2xs"
                        : "border-stone-200 bg-[#FAFBF9] text-stone-600 hover:bg-white hover:border-stone-300"
                    }`}
                  >
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIONS BAR */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset form</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#FA6432] hover:bg-[#e45222] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze Symptoms</span>
            </button>
          </div>

        </div>

        {/* RESULTS & CLINICAL ASSESSMENT (5 Cols) */}
        <div className="lg:col-span-5">
          {!analyzed ? (
            /* PRE-ANALYSIS SERENE PLACEHOLDER */
            <div className="flex min-h-115 flex-col items-center justify-center rounded-[30px] border border-stone-200/80 bg-white p-8 text-center shadow-xs space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F4F0] text-[#285943]">
                <Activity className="h-8 w-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1 max-w-xs">
                <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-3 py-0.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                  ready for evaluation
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Select your symptoms
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Choose one or more active symptoms, duration, and severity on the left to produce an immediate clinical recommendation.
                </p>
              </div>
            </div>
          ) : (
            /* POST-ANALYSIS BENTO CARD */
            <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF4EC] text-[#285943] shadow-xs">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="rounded-full border border-[#77af9c]/30 bg-[#E8F4F0] px-2.5 py-0.5 text-[10px] font-bold text-[#285943]">
                      Clinical Assessment
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Triage Summary
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-stone-400">
                  Instant Result
                </span>
              </div>

              {/* Selected Factors Pill Box */}
              <div className="rounded-2xl border border-stone-100 bg-[#FAFBF9] p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-stone-600">Selected Symptoms:</span>
                  <div className="flex flex-wrap gap-1 max-w-50 justify-end">
                    {selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="font-semibold text-stone-600">Timeline / Duration:</span>
                  <span className="font-bold text-slate-800">{duration || "Not specified"}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="font-semibold text-stone-600">Reported Intensity:</span>
                  <span className={`font-bold ${
                    severity === "Severe"
                      ? "text-rose-600"
                      : severity === "Moderate"
                      ? "text-amber-600"
                      : "text-[#285943]"
                  }`}>
                    {severity || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Care Step Recommendation */}
              <div className={`rounded-2xl border p-4.5 space-y-2 ${
                severity === "Severe"
                  ? "border-rose-200 bg-rose-50/70 text-rose-900"
                  : "border-[#77af9c]/40 bg-[#E8F4F0]/60 text-[#1E4533]"
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-4 w-4 ${severity === "Severe" ? "text-rose-600" : "text-[#285943]"}`} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Recommended Clinical Step
                  </h4>
                </div>
                <p className="text-xs leading-relaxed">
                  {severity === "Severe"
                    ? "Based on severe intensity and reported progression, we strongly recommend scheduling an urgent consultation with a qualified specialist immediately."
                    : "Symptoms appear mild to moderate. Rest, hydration, and active observation over the next 24-48 hours is advised. If symptoms intensify, book a doctor visit."}
                </p>
              </div>

              {/* Emergency Hotline Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-[#FAFBF9] px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-stone-500">
                  <PhoneCall className="h-4 w-4 text-rose-500" />
                  <span>Immediate Emergency?</span>
                </div>
                <span className="font-bold text-rose-600">
                  Dial 102 / 911
                </span>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ── 4. FOOTER NOTE ── */}
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white/70 px-5 py-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#77af9c] shrink-0" />
          <span>This triage tool offers automated guidance and is not a substitute for professional in-person medical diagnosis.</span>
        </div>
      </div>

    </div>
  );
};

export default SymptomCheckerView;