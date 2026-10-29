import { Bot, ArrowRight, ShieldAlert } from "lucide-react";

const AiAssistantCard = ({ onStartChat }) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <Bot className="h-4.5 w-4.5" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/60 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          24/7 Clinical AI
        </span>
      </div>

      {/* Content */}
      <div className="mt-3.5">
        <h3 className="text-sm font-semibold text-slate-900">
          Clinical AI Navigator
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Ask questions about symptoms, clarify medication dosages, or prepare structured notes for your next physician consultation.
        </p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onStartChat}
        className="mt-4.5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all duration-200 hover:bg-slate-800 active:scale-[0.99]"
      >
        <span>Open Health Assistant</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {/* Clinical Disclaimer */}
      <div className="mt-3.5 flex items-start gap-1.5 border-t border-slate-100 pt-3 text-[10px] leading-tight text-slate-400">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>Informational assistant only. For emergencies, please call emergency services immediately.</span>
      </div>
    </div>
  );
};

export default AiAssistantCard;