import { ArrowUpRight } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col justify-between rounded-2xl border border-[#77af9c]/20 bg-white p-5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#77af9c] hover:shadow-md hover:shadow-[#285943]/5 focus:outline-none focus:ring-2 focus:ring-[#77af9c]/20 ${className}`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8cd790]/50 bg-[#d7fff1] text-[#285943] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#aafcb8]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex h-6 w-6 items-center justify-center text-slate-300 transition-all duration-200 group-hover:text-[#285943] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#77af9c]">
          {title}
        </p>
      </div>
      {subtitle && (
        <div className="mt-3.5 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8cd790] transition-colors group-hover:bg-[#285943]" />
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </button>
  );
};

export default StatCard;