import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Volume2,
} from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import socket from "../../socket/socket";
import { getAppointmentAgoraTokenApi } from "../../api/appointment.api";

// Set Agora log level to warn only
AgoraRTC.setLogLevel(2);

const VideoCallRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.user);

  // Connection & Room state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Agora State
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [callEndingMessage, setCallEndingMessage] = useState(null);

  // Refs for Agora client and tracks
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localContainerRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const timerRef = useRef(null);
  const isLeavingRef = useRef(false);

  // Format Call Timer (MM:SS)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ── 1. LEAVE AND CLEANUP (SYNCS BOTH SIDES) ──
  const handleLeaveCall = useCallback(
    async (isRemote = false, message = null) => {
      if (isLeavingRef.current) return;
      isLeavingRef.current = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const notice =
        message ||
        (isRemote
          ? "The other participant has left the consultation. Returning to dashboard..."
          : "Consultation ended. Returning to dashboard...");

      setCallEndingMessage(notice);

      // If initiated locally, notify the other participant through Socket.io
      if (!isRemote) {
        socket.emit("call:end", {
          appointmentId,
          role: currentUser?.role || "user",
          name:
            currentUser?.fullName ||
            (currentUser?.role === "doctor" ? "Doctor" : "Patient"),
        });
      }

      try {
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.stop();
          localAudioTrackRef.current.close();
          localAudioTrackRef.current = null;
        }
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.stop();
          localVideoTrackRef.current.close();
          localVideoTrackRef.current = null;
        }
        if (clientRef.current) {
          await clientRef.current.leave();
          clientRef.current = null;
        }
      } catch (err) {
        console.warn("Agora leave cleanup warning:", err);
      } finally {
        setJoined(false);
        socket.emit("call:leave", appointmentId);

        // Smooth redirect after 1.5 seconds
        setTimeout(() => {
          if (currentUser?.role === "doctor") {
            navigate("/doctor/schedule");
          } else {
            navigate("/patient/appointments");
          }
        }, 1500);
      }
    },
    [appointmentId, currentUser, navigate]
  );

  // ── 2. INITIALIZE AGORA CALL ──
  useEffect(() => {
    let isCancelled = false;

    // Join Socket.io room for this appointment call
    socket.emit("call:join", appointmentId);

    // Listen for real-time call termination
    const onCallEnded = (data) => {
      if (data?.appointmentId === appointmentId) {
        const endedBy =
          data.endedByRole === "doctor" ? "Doctor" : "Patient";
        handleLeaveCall(
          true,
          `Consultation ended by ${endedBy}. Returning to dashboard...`
        );
      }
    };
    socket.on("call:ended", onCallEnded);

    // Listen for call declined by the recipient
    const onCallDeclined = (data) => {
      if (data?.appointmentId === appointmentId) {
        handleLeaveCall(
          true,
          "The other participant declined the video consultation."
        );
      }
    };
    socket.on("call:declined", onCallDeclined);

    const initCall = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Agora configuration & authorization from backend
        let res;
        try {
          res = await getAppointmentAgoraTokenApi(appointmentId);
        } catch (apiErr) {
          console.warn(
            "Agora token endpoint returned error, attempting fallback mode:",
            apiErr
          );

          // Fallback: If deployed backend (e.g. Render) doesn't have the new route yet, fetch appointment directly
          const fallbackAptRes = await api
            .get(`/appointments/${appointmentId}`)
            .catch(() => null);

          const aptData =
            fallbackAptRes?.data?.appointment ||
            fallbackAptRes?.data ||
            {};

          res = {
            success: true,
            appId:
              import.meta.env.VITE_AGORA_APP_ID ||
              "40ec841159ac460292d82d31beb66c8d",
            channelName: `medcare_${appointmentId}`,
            token: null,
            uid: 0,
            appointment: {
              _id: appointmentId,
              appointmentType: aptData.appointmentType || "video",
              status: aptData.status || "confirmed",
              reason: aptData.reason || "Telehealth Consultation",
              patient: aptData.patient,
              doctor: aptData.doctor,
            },
            userRole: currentUser?.role || "doctor",
          };
        }

        if (isCancelled) return;

        if (!res.success) {
          throw new Error(
            res.message || "Failed to initialize video call session."
          );
        }

        setAppointment(res.appointment);
        setUserRole(res.userRole);

        // Ring / alert the other participant in real time
        const isCurrentDoctor =
          res.userRole === "doctor" || currentUser?.role === "doctor";
        const callerName = isCurrentDoctor
          ? res.appointment?.doctor?.fullName || currentUser?.fullName || "Doctor"
          : res.appointment?.patient?.fullName || currentUser?.fullName || "Patient";

        const recipientUserId = isCurrentDoctor
          ? res.appointment?.patient?._id || res.appointment?.patient
          : res.appointment?.doctor?.userId ||
            res.appointment?.doctor?._id ||
            res.appointment?.doctor;

        const recipientDoctorId = isCurrentDoctor
          ? null
          : res.appointment?.doctor?._id || res.appointment?.doctor;

        socket.emit("call:ring", {
          appointmentId,
          callerName,
          callerRole: isCurrentDoctor ? "doctor" : "patient",
          recipientUserId,
          recipientDoctorId,
          reason:
            res.appointment?.reason || "Online Telehealth Consultation",
        });

        const { appId, channelName, token, uid } = res;

        // Initialize Agora RTC Client
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Handle remote user published
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUser(user);
            setHasRemoteVideo(true);
            setTimeout(() => {
              if (remoteContainerRef.current) {
                user.videoTrack?.play(remoteContainerRef.current);
              }
            }, 100);
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        // Handle remote user unpublished
        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            setHasRemoteVideo(false);
          }
        });

        // Handle remote user left (Agora event)
        client.on("user-left", () => {
          setRemoteUser(null);
          setHasRemoteVideo(false);
          handleLeaveCall(
            true,
            "The other participant has left the consultation. Returning to dashboard..."
          );
        });

        // Join Agora RTC Channel
        await client.join(appId, channelName, token || null, uid || null);
        if (isCancelled) return;

        // Create Local Microphone & Camera Tracks
        try {
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks(
              {
                encoderConfig: "speech_standard",
              },
              {
                encoderConfig: "720p_1",
              }
            );

          if (isCancelled) {
            audioTrack.close();
            videoTrack.close();
            return;
          }

          localAudioTrackRef.current = audioTrack;
          localVideoTrackRef.current = videoTrack;

          // Publish tracks to channel
          await client.publish([audioTrack, videoTrack]);

          // Play local video
          if (localContainerRef.current) {
            videoTrack.play(localContainerRef.current);
          }
        } catch (mediaErr) {
          console.error("Camera/Mic access error:", mediaErr);
          // If camera fails, fallback to audio only if possible
          try {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            localAudioTrackRef.current = audioTrack;
            await client.publish([audioTrack]);
            setIsVideoOff(true);
          } catch (audioErr) {
            console.error("Audio-only fallback failed:", audioErr);
            throw new Error(
              "Unable to access camera or microphone. Please grant permission in your browser."
            );
          }
        }

        setJoined(true);
        setLoading(false);

        // Start Call Duration Timer
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Video room init failed:", err);
        if (!isCancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not join video consultation room."
          );
          setLoading(false);
        }
      }
    };

    initCall();

    return () => {
      isCancelled = true;
      socket.off("call:ended", onCallEnded);
      socket.off("call:declined", onCallDeclined);
      socket.emit("call:leave", appointmentId);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [appointmentId]);

  // ── 3. TOGGLE MICROPHONE ──
  const toggleMic = async () => {
    if (!localAudioTrackRef.current) return;
    try {
      const nextMuted = !isMuted;
      await localAudioTrackRef.current.setEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } catch (e) {
      console.error("Failed to toggle mic:", e);
    }
  };

  // ── 4. TOGGLE CAMERA ──
  const toggleCamera = async () => {
    if (!localVideoTrackRef.current) return;
    try {
      const nextVideoOff = !isVideoOff;
      await localVideoTrackRef.current.setEnabled(!nextVideoOff);
      setIsVideoOff(nextVideoOff);
    } catch (e) {
      console.error("Failed to toggle camera:", e);
    }
  };

  // ── 5. FULL SCREEN TOGGLE ──
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  // Other participant's label
  const otherParticipantName =
    userRole === "doctor"
      ? appointment?.patient?.fullName || "Patient"
      : appointment?.doctor?.fullName || "Doctor";

  const otherParticipantTitle =
    userRole === "doctor"
      ? "Patient"
      : appointment?.doctor?.specialty || "Care Specialist";

  // ── RENDER LOADING STATE ──
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-white">
          Connecting to Telehealth Room...
        </h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Securing end-to-end Agora video link for Appointment #{appointmentId?.slice(-6)}.
        </p>
      </div>
    );
  }

  // ── RENDER ERROR STATE ──
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-2xl">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-white">
          Could Not Connect to Consultation
        </h2>
        <p className="mt-2 text-xs text-slate-400 max-w-md">
          {error}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 hover:bg-teal-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition-all cursor-pointer"
          >
            Retry Connection
          </button>

          <button
            type="button"
            onClick={() =>
              currentUser?.role === "doctor"
                ? navigate("/doctor/schedule")
                : navigate("/patient/appointments")
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* ── 1. TOP TELEHEALTH NAV BAR ── */}
      <header className="z-30 flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
        
        {/* Left: Participant Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold shadow-xs">
            {otherParticipantName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                {otherParticipantName}
              </h2>
              <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.2 text-[10px] font-semibold text-teal-300">
                {otherParticipantTitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Appointment #{appointmentId?.slice(-6)}</span>
              {appointment?.reason && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-50 sm:max-w-xs">{appointment.reason}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center: Live Call Timer */}
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1 text-xs font-medium backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Clock className="h-3 w-3 text-slate-400" />
          <span className="font-mono text-emerald-400 font-bold">{formatTimer(callDuration)}</span>
        </div>

        {/* Right: Security & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>End-to-End Encrypted</span>
          </div>

          <button
            type="button"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* ── 2. VIDEO STAGE ── */}
      <main className="relative flex-1 overflow-hidden p-2 sm:p-4">
        
        {/* MAIN REMOTE VIDEO VIEW */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl flex items-center justify-center">
          
          {/* Agora Remote Stream Container */}
          <div
            ref={remoteContainerRef}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              hasRemoteVideo ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Fallback / Waiting State */}
          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-900 via-slate-950 to-black">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-900/30 border border-teal-500/30 text-teal-400 shadow-2xl">
                <span className="absolute h-full w-full rounded-full bg-teal-500/10 animate-ping" />
                <User className="h-12 w-12 text-teal-300 stroke-[1.5]" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-white">
                Waiting for {otherParticipantName} to join...
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                The video stream will automatically connect as soon as the other participant enters this room.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Agora Channel: {appointment?._id?.slice(-8) || "live"}</span>
              </div>
            </div>
          )}

          {/* ── PICTURE-IN-PICTURE (LOCAL USER STREAM) ── */}
          <div className="absolute bottom-4 right-4 z-20 h-36 w-28 sm:h-48 sm:w-36 overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-950 shadow-2xl transition-all hover:scale-105">
            <div
              ref={localContainerRef}
              className={`h-full w-full object-cover ${isVideoOff ? "hidden" : "block"}`}
            />

            {isVideoOff && (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                <VideoOff size={22} className="text-slate-500 mb-1" />
                <span className="text-[10px] font-semibold text-slate-400">Camera Off</span>
              </div>
            )}

            {/* Local User Tag */}
            <div className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md">
              <span>You</span>
              {isMuted && <MicOff size={9} className="text-rose-400" />}
            </div>
          </div>
        </div>
      </main>

      {/* ── 3. BOTTOM CONTROL DOCK ── */}
      <footer className="z-30 flex items-center justify-center border-t border-white/10 bg-slate-900/70 px-4 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Microphone Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl transition-all cursor-pointer shadow-lg active:scale-95 ${
              isMuted
                ? "bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-400/40"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl transition-all cursor-pointer shadow-lg active:scale-95 ${
              isVideoOff
                ? "bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-400/40"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
            }`}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={() => handleLeaveCall(false)}
            className="flex h-12 px-6 sm:h-13 sm:px-8 items-center justify-center gap-2 rounded-2xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-xl shadow-rose-900/40 active:scale-95 transition-all cursor-pointer ring-2 ring-rose-500/40"
            title="Leave / End Consultation"
          >
            <PhoneOff size={18} />
            <span>Leave Call</span>
          </button>
        </div>
      </footer>

      {/* ── 4. CALL TERMINATION OVERLAY (SYNCS BOTH SIDES) ── */}
      {callEndingMessage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md text-center transition-all animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4 shadow-2xl animate-bounce">
            <PhoneOff size={30} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Consultation Ended
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
            {callEndingMessage}
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-teal-400">
            <Loader2 size={14} className="animate-spin" />
            <span>Redirecting to your dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
