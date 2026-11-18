import { useEffect, useState, useRef } from "react";
import { ShieldAlert, Smartphone, Copy, Check, X, MonitorSmartphone } from "lucide-react";
import socket from "../../socket/socket";

/**
 * SecurityLoginOtpAlert
 * Displayed on an already signed-in trusted device whenever a new device
 * attempts to log into the same account and requires 6-digit OTP verification.
 */
const SecurityLoginOtpAlert = () => {
  const [otpAlert, setOtpAlert] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [copied, setCopied] = useState(false);
  const [supersededNotice, setSupersededNotice] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const clearCountdown = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleLoginOtp = (data) => {
      if (!data?.otp) return;
      clearCountdown();
      setSupersededNotice(null);
      setOtpAlert(data);
      setCopied(false);
      setSecondsLeft(data.expiresInSeconds || 300);

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearCountdown();
            setOtpAlert(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleOtpCleared = () => {
      clearCountdown();
      setOtpAlert(null);
    };

    const handleSuperseded = (data) => {
      clearCountdown();
      setOtpAlert(null);
      setSupersededNotice(
        `Signed in on ${data?.newDeviceInfo || "a new device"}. Incoming video calls will now ring only on your latest device.`
      );
      setTimeout(() => {
        setSupersededNotice(null);
      }, 8000);
    };

    socket.on("security:login-otp", handleLoginOtp);
    socket.on("security:login-otp-cleared", handleOtpCleared);
    socket.on("session:superseded", handleSuperseded);

    return () => {
      clearCountdown();
      socket.off("security:login-otp", handleLoginOtp);
      socket.off("security:login-otp-cleared", handleOtpCleared);
      socket.off("session:superseded", handleSuperseded);
    };
  }, []);

  const handleCopy = () => {
    if (!otpAlert?.otp) return;
    navigator.clipboard?.writeText(otpAlert.otp).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (supersededNotice && !otpAlert) {
    return (
      <div className="fixed bottom-5 right-4 sm:right-6 z-[999998] w-[calc(100vw-32px)] max-w-sm">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
            <MonitorSmartphone size={18} />
          </div>
          <div className="flex-1 text-xs leading-relaxed text-slate-200">
            <p className="font-bold text-amber-300 mb-0.5">New Active Device</p>
            <p>{supersededNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setSupersededNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (!otpAlert) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[999998] w-[calc(100vw-32px)] max-w-sm">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-amber-500/25">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <ShieldAlert size={16} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              New Device Login OTP
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOtpAlert(null)}
            className="rounded-full p-1 text-slate-400 hover:text-white cursor-pointer"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-3.5 text-xs text-slate-300 leading-relaxed">
          <p>
            A sign-in attempt was detected from{" "}
            <strong className="text-white">{otpAlert.deviceInfo || "New Device"}</strong>.
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-teal-300">
            <Smartphone size={12} />
            <span>Mobile OTP for {otpAlert.maskedPhone}</span>
          </p>
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-teal-500/30 bg-teal-500/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">
              Verification Code ({formatTime(secondsLeft)})
            </p>
            <p className="mt-0.5 font-mono text-2xl font-extrabold tracking-[0.28em] text-white">
              {otpAlert.otp}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <p className="mt-3 text-[11px] text-amber-200/95 leading-snug">
          Enter this 6-digit code on your <strong>new device&apos;s Login screen</strong> to complete sign-in. Only share if <strong>you</strong> are logging in.
        </p>
      </div>
    </div>
  );
};

export default SecurityLoginOtpAlert;
