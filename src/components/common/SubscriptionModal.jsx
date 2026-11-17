import { useState } from "react";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
  X,
  Zap,
  ArrowRight,
  Clock,
  Lock,
} from "lucide-react";
import { subscribeToPlanApi } from "../../services/subscription.service";

const SubscriptionModal = ({
  isOpen,
  onClose,
  onSubscribed,
  reason = "trial_expired", // "trial_expired" | "locked" | "upgrade"
}) => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await subscribeToPlanApi(selectedPlan, "upi");

      setSuccessMessage(
        res.message || "Welcome to MedCare Premium! Unlimited video consultations unlocked."
      );

      setTimeout(() => {
        if (onSubscribed) onSubscribed(res);
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Subscription failed:", err);
      setError(
        err.response?.data?.message || "Failed to process subscription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-teal-500/30 bg-slate-900 shadow-2xl text-white">
        
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full bg-teal-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header Icon & Title */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 mb-4">
              <Crown className="h-7 w-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-xs font-semibold text-teal-300 mb-2">
              <Sparkles size={12} className="text-teal-400" />
              <span>Telehealth Premium Subscription</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {reason === "trial_expired"
                ? "Your 5-Minute Free Consultation Has Ended"
                : "Video Consultations are a Premium Feature"}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {reason === "trial_expired"
                ? "First-time video consultation is free for 5 minutes. To continue unlimited HD video visits with doctors, please choose a subscription plan."
                : "Every patient gets 1 free 5-minute trial. Afterwards, an active MedCare Care+ subscription is required for unlimited video calls."}
            </p>
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300 text-center font-semibold">
              ✓ {successMessage}
            </div>
          )}

          {/* Plan Selector */}
          <div className="mt-6 space-y-3">
            
            {/* Plan 1: Monthly */}
            <div
              onClick={() => setSelectedPlan("monthly")}
              className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPlan === "monthly"
                  ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500/40"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    selectedPlan === "monthly"
                      ? "border-teal-400 bg-teal-500 text-white"
                      : "border-slate-500"
                  }`}
                >
                  {selectedPlan === "monthly" && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Video Consultation Pass</span>
                    <span className="rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-semibold">
                      Popular
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unlimited video consultations with all specialists (30 days)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-white">₹100</span>
                <span className="text-xs text-slate-400">/mo</span>
              </div>
            </div>

            {/* Plan 2: Annual (Popular) */}
            <div
              onClick={() => setSelectedPlan("annual")}
              className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPlan === "annual"
                  ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                Full Year Access
              </span>

              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    selectedPlan === "annual"
                      ? "border-amber-400 bg-amber-500 text-slate-950"
                      : "border-slate-500"
                  }`}
                >
                  {selectedPlan === "annual" && (
                    <div className="h-2 w-2 rounded-full bg-slate-950" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Annual Telehealth Pass</span>
                    <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-semibold border border-amber-500/30">
                      1 Year
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    All-year unlimited consultations + priority 24/7 care
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-white">₹999</span>
                <span className="text-xs text-slate-400">/yr</span>
              </div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-3.5">
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>Unlimited Video Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>No 5-Min Time Limits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>Verified MD Specialists</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>Digital Prescriptions</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={loading || Boolean(successMessage)}
              onClick={handleSubscribe}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-900/40 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Activating Subscription...</span>
              ) : successMessage ? (
                <span>Active & Ready!</span>
              ) : (
                <>
                  <Zap size={15} />
                  <span>
                    Activate {selectedPlan === "annual" ? "Annual" : "Monthly"} Plan (
                    {selectedPlan === "annual" ? "₹999" : "₹100"})
                  </span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
