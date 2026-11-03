import { useEffect } from "react";
import { LogOut, X, Loader2 } from "lucide-react";

/**
 * ConfirmationModal
 * A clean, accessible modal dialog for confirming critical actions (e.g., logout).
 */
export default function ConfirmationModal({
  isOpen,
  title = "Confirm Logout",
  message = "Are you sure you want to log out of your account?",
  confirmLabel = "Confirm Logout",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  // Close on Escape key if not loading
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel?.();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={() => {
        if (!isLoading) onCancel?.();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 shadow-xs">
            <LogOut size={22} strokeWidth={2.2} />
          </div>

          <div className="flex-1 pr-4">
            <h3
              id="confirmation-modal-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Logging out...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
