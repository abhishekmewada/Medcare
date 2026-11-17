import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Video, PhoneOff, Check, Stethoscope, User, X } from "lucide-react";
import socket from "../../socket/socket";

// Helper: Soothing professional medical chime using Web Audio API
const playMedicalChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + start + duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // 3-tone gentle medical chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
    playTone(523.25, 0, 0.35);
    playTone(659.25, 0.22, 0.35);
    playTone(783.99, 0.44, 0.6);
  } catch (e) {
    // Autoplay restrictions may silence sound until user interacts with the page
  }
};

const IncomingCallAlert = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth?.user);

  const [incomingCall, setIncomingCall] = useState(null);
  const [alertSeconds, setAlertSeconds] = useState(45);

  const incomingCallRef = useRef(null);
  const currentUserRef = useRef(currentUser);
  const locationRef = useRef(location);
  const chimeIntervalRef = useRef(null);
  const autoDismissTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  // Stop ring chime and timers
  const stopChime = useCallback(() => {
    if (chimeIntervalRef.current) {
      clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  }, []);

  // ── HANDLE ACCEPT ──
  const handleAccept = useCallback(() => {
    const activeCall = incomingCallRef.current;
    if (!activeCall) return;
    const targetAppointmentId = activeCall.appointmentId;
    stopChime();
    setIncomingCall(null);
    navigate(`/video-call/${targetAppointmentId}`);
  }, [stopChime, navigate]);

  // ── HANDLE DECLINE ──
  const handleDecline = useCallback(() => {
    const activeCall = incomingCallRef.current;
    if (!activeCall) return;
    const current = currentUserRef.current;

    socket.emit("call:decline", {
      appointmentId: activeCall.appointmentId,
      declinedByRole: current?.role || "user",
      declinedByName: current?.fullName || "User",
    });

    stopChime();
    setIncomingCall(null);
  }, [stopChime]);

  useEffect(() => {
    const handleIncoming = (data) => {
      console.log("🔔 [IncomingCallAlert] call:incoming event received:", data);

      if (!data?.appointmentId) return;

      // Don't show alert if user is already inside this video call
      if (
        locationRef.current.pathname.includes(
          `/video-call/${data.appointmentId}`
        )
      ) {
        return;
      }

      // Don't show alert to the caller themselves
      const myId = currentUserRef.current?._id?.toString();
      if (myId && data.callerUserId && data.callerUserId.toString() === myId) {
        return;
      }

      setIncomingCall(data);
      setAlertSeconds(45);

      // Play sound immediately and repeat every 3.5 seconds
      playMedicalChime();
      if (!chimeIntervalRef.current) {
        chimeIntervalRef.current = setInterval(playMedicalChime, 3500);
      }

      // 45-second ticking countdown for recipient
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      countdownIntervalRef.current = setInterval(() => {
        setAlertSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto dismiss after 45 seconds if unanswered
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
      autoDismissTimerRef.current = setTimeout(() => {
        stopChime();
        setIncomingCall(null);
      }, 45000);
    };

    const handleCallEnded = (data) => {
      if (
        incomingCallRef.current &&
        incomingCallRef.current.appointmentId === data?.appointmentId
      ) {
        stopChime();
        setIncomingCall(null);
      }
    };

    const handleCallDeclined = (data) => {
      if (
        incomingCallRef.current &&
        incomingCallRef.current.appointmentId === data?.appointmentId
      ) {
        stopChime();
        setIncomingCall(null);
      }
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:declined", handleCallDeclined);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:declined", handleCallDeclined);
    };
  }, [stopChime]);

  if (!incomingCall) return null;

  const isDoctor = incomingCall.callerRole === "doctor";
  const callerInitial =
    incomingCall.callerName?.charAt(0)?.toUpperCase() ||
    (isDoctor ? "D" : "P");

  return (
    <div className="fixed top-5 right-4 sm:right-8 z-999999 w-[calc(100vw-32px)] sm:w-96 max-w-sm transition-all duration-300">
      <div className="relative overflow-hidden rounded-3xl borderborder border-teal-400/25
bg-slate-950/65
p-4 sm:p-5
shadow-[0_8px_40px_rgba(0,0,0,0.35)]
backdrop-blur-2xl
text-white
ring-1 ring-white/10">
        {/* Ambient Ringing Glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl animate-pulse" />

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
            <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300">
              {alertSeconds}s
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
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-lg shadow-sm">
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
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
              {incomingCall.reason || "Scheduled Video Consultation"}
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
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-teal-600 hover:bg-teal-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-900/30 transition-all cursor-pointer active:scale-95"
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
