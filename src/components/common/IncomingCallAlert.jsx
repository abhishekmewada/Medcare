import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Video, PhoneOff, Check, Stethoscope, User, X } from "lucide-react";
import socket from "../../socket/socket";

// Helper: Pleasant medical chime ringtone using Web Audio API
const playMedicalChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // 2-tone gentle chime (D5 then A5)
    playTone(587.33, 0, 0.4);
    playTone(880.0, 0.25, 0.6);
  } catch (e) {
    // Autoplay restrictions may silence sound until first user gesture
  }
};

const IncomingCallAlert = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth?.user);

  const [incomingCall, setIncomingCall] = useState(null);
  const chimeIntervalRef = useRef(null);
  const autoDismissTimerRef = useRef(null);

  // Stop ring chime
  const stopChime = useCallback(() => {
    if (chimeIntervalRef.current) {
      clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  }, []);

  // ── HANDLE ACCEPT ──
  const handleAccept = useCallback(() => {
    if (!incomingCall) return;
    const targetAppointmentId = incomingCall.appointmentId;
    stopChime();
    setIncomingCall(null);
    navigate(`/video-call/${targetAppointmentId}`);
  }, [incomingCall, stopChime, navigate]);

  // ── HANDLE DECLINE ──
  const handleDecline = useCallback(() => {
    if (!incomingCall) return;
    socket.emit("call:decline", {
      appointmentId: incomingCall.appointmentId,
      declinedByRole: currentUser?.role || "user",
      declinedByName: currentUser?.fullName || "User",
    });
    stopChime();
    setIncomingCall(null);
  }, [incomingCall, currentUser, stopChime]);

  useEffect(() => {
    // Only listen if user is logged in
    if (!currentUser) return;

    const handleIncoming = (data) => {
      // Don't show alert if user is already inside this call
      if (location.pathname.includes(`/video-call/${data?.appointmentId}`)) {
        return;
      }

      setIncomingCall(data);

      // Play sound chime immediately and loop every 3 seconds
      playMedicalChime();
      chimeIntervalRef.current = setInterval(playMedicalChime, 3000);

      // Auto dismiss after 30 seconds if unanswered
      autoDismissTimerRef.current = setTimeout(() => {
        stopChime();
        setIncomingCall(null);
      }, 30000);
    };

    const handleCallEnded = (data) => {
      // If caller canceled before we answered
      if (incomingCall?.appointmentId === data?.appointmentId) {
        stopChime();
        setIncomingCall(null);
      }
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:ended", handleCallEnded);
      stopChime();
    };
  }, [currentUser, location.pathname, incomingCall, stopChime]);

  if (!incomingCall) return null;

  const isDoctor = incomingCall.callerRole === "doctor";
  const callerInitial = incomingCall.callerName?.charAt(0)?.toUpperCase() || (isDoctor ? "D" : "P");

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-[9999] w-[calc(100vw-32px)] sm:w-96 max-w-sm animate-bounce-in">
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-white">
        
        {/* Ambient Ringing Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-teal-500/20 blur-2xl animate-pulse" />

        {/* Top Header Pill */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              Incoming Video Call
            </span>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            className="rounded-full p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>

        {/* Caller Info Block */}
        <div className="flex items-center gap-3.5 my-3.5">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold text-lg shadow-sm">
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Video size={9} />
            </span>
            {callerInitial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isDoctor ? (
                <Stethoscope size={13} className="text-teal-400 shrink-0" />
              ) : (
                <User size={13} className="text-teal-400 shrink-0" />
              )}
              <h4 className="truncate text-base font-bold text-white">
                {incomingCall.callerName}
              </h4>
            </div>

            <p className="mt-0.5 truncate text-xs text-slate-300">
              {incomingCall.reason || "Scheduled Consultation"}
            </p>
          </div>
        </div>

        {/* Action Buttons (Accept vs Decline) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDecline}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition-all cursor-pointer active:scale-95"
          >
            <PhoneOff size={13} />
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-teal-600 hover:bg-teal-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-900/30 transition-all cursor-pointer active:scale-95 animate-pulse"
          >
            <Check size={14} strokeWidth={2.8} />
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallAlert;
