import { useState, useEffect, useRef } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Clock,
  RotateCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  forgotPassword,
  verifyResetOtp,
  resendResetOtp,
  resetPassword,
} from "../../services/auth.service";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Steps: "email" -> "otp" -> "new-password" -> "success"
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetSessionToken, setResetSessionToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for 5-minute OTP expiration (300 seconds)
  const [otpTimer, setOtpTimer] = useState(300);
  // Cooldown timer for 60-second Resend OTP (Requirement 6)
  const [resendCooldown, setResendCooldown] = useState(60);

  // Remaining verification attempts (Requirement 5: Max 5 attempts)
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  const otpInputRefs = useRef([]);

  // Timer effect for OTP expiration
  useEffect(() => {
    let interval = null;
    if (step === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Timer effect for Resend Cooldown
  useEffect(() => {
    let interval = null;
    if (step === "otp" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Helper to format seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Mask email for security display (e.g., jo***@domain.com)
  const maskEmail = (str) => {
    if (!str || !str.includes("@")) return str;
    const [name, domain] = str.split("@");
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  // STEP 1: Submit Email for OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email.trim().toLowerCase());
      setSuccessMsg(res.message || "A 6-digit verification code has been sent.");
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(300); // 5 minutes
      setResendCooldown(60); // 60s cooldown
      setRemainingAttempts(5);

      // Auto focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError(
        err.response?.data?.message ||
          "Unable to send verification code. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP Input handlers (supports auto-advancing, backspace, and pasting full code)
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    // Single digit input
    const singleDigit = cleaned.slice(-1);
    const updated = [...otp];
    updated[index] = singleDigit;
    setOtp(updated);

    // Auto advance to next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split("");
    const updated = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      updated[i] = d;
    });
    setOtp(updated);

    const nextIndex = Math.min(digits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // STEP 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    if (otpTimer <= 0) {
      setError("The verification code has expired. Please request a new code.");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: fullCode,
      });

      if (res.resetSessionToken) {
        setResetSessionToken(res.resetSessionToken);
        setStep("new-password");
        setError("");
        setSuccessMsg("");
      } else {
        throw new Error("Invalid session token received.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      const serverMsg = err.response?.data?.message || "Invalid verification code.";
      const attemptsLeft = err.response?.data?.remainingAttempts;
      if (typeof attemptsLeft === "number") {
        setRemainingAttempts(attemptsLeft);
      }
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2b: Resend OTP (Rate limited: 60s cooldown)
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setError("");
    setSuccessMsg("");

    try {
      setLoading(true);
      const res = await resendResetOtp(email.trim().toLowerCase());
      setSuccessMsg("A new 6-digit code has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(300); // Reset 5 minutes
      setResendCooldown(60); // Reset 60s cooldown
      setRemainingAttempts(5);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError(
        err.response?.data?.message || "Failed to resend code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email: email.trim().toLowerCase(),
        resetSessionToken,
        newPassword,
        confirmPassword,
      });

      setStep("success");
    } catch (err) {
      console.error("Reset password failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Your session may have expired. Please restart the process."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] p-4 sm:p-6 lg:p-10">
      {/* Background Styling */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/circle-scatter-haikei.png"
          alt="MedCare Background"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-linear-to-tr from-teal-950/60 via-slate-900/30 to-sky-950/40 mix-blend-multiply" />
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-teal-400/20 blur-[130px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-[140px]" />
      </div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row"
      >
        {/* Left Side: Healthcare Visual & Security Reassurance */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden p-10 xl:p-12 text-white">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/imgi_4_pexels-photo-7578797.jpg"
              alt="Medical security"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#041a1c]/95 via-[#06292c]/75 to-[#041a1c]/45" />
            <div className="absolute inset-0 bg-[#0f766e]/20 mix-blend-multiply" />
          </div>

          {/* Top Logo & Back to Login */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-teal-300 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Middle Security Context */}
          <div className="relative z-10 my-auto py-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/15 px-3.5 py-1 text-xs font-medium text-teal-100 backdrop-blur-sm">
              <KeyRound size={14} className="text-teal-300" />
              <span>Account Recovery & Protection</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl leading-[1.2]">
              Secure Access, <br />
              <span className="text-teal-300">Protected Care.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200/90">
              Your patient and clinical credentials are safeguarded by 256-bit encryption
              and rapid multi-factor verification.
            </p>

            {/* Security checklist */}
            <div className="mt-8 space-y-3 max-w-sm">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md text-xs font-semibold text-white">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0" />
                <span>One-Time 6-Digit Verification Code</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md text-xs font-semibold text-white">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0" />
                <span>5-Minute Automatic Expiration</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md text-xs font-semibold text-white">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0" />
                <span>End-to-End Encrypted Session</span>
              </div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 border-t border-white/15 pt-4">
            <p className="text-xs text-slate-300">
              Applicable to both registered Patients and verified Medical Specialists.
            </p>
          </div>
        </div>

        {/* Right Side: Form Wizard */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-14">
          {/* Mobile Back Link */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>

            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <ShieldCheck size={13} />
              Verified Recovery
            </span>
          </div>

          {/* Error Message Box */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                <span className="flex-1 text-xs sm:text-sm">{error}</span>
              </motion.div>
            )}

            {successMsg && step === "otp" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/90 p-3.5 text-sm text-teal-800"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-teal-600" />
                <span className="flex-1 text-xs sm:text-sm">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================
              STEP 1: ENTER REGISTERED EMAIL
          ========================================================= */}
          {step === "email" && (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Forgot Password?
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Enter your registered email address. We will send a 6-digit verification code to reset your account password.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Registered Email Address
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail size={18} />
                    </div>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com or doctor@medcare.com"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              STEP 2: ENTER 6-DIGIT OTP
          ========================================================= */}
          {step === "otp" && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Enter Verification Code
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <strong className="text-slate-800">{maskEmail(email)}</strong>. Enter it below to verify your identity.
                </p>
              </div>

              {/* Countdown & Attempts Status Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Clock size={14} className={otpTimer > 60 ? "text-teal-600" : "text-rose-500 animate-pulse"} />
                  <span>
                    Expires in:{" "}
                    <strong className={otpTimer > 60 ? "text-slate-900" : "text-rose-600 font-bold"}>
                      {formatTime(otpTimer)}
                    </strong>
                  </span>
                </div>

                <div className="text-slate-500">
                  Attempts left:{" "}
                  <strong className={remainingAttempts <= 2 ? "text-rose-600" : "text-slate-800"}>
                    {remainingAttempts}/5
                  </strong>
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="mt-6 space-y-6">
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={loading || otpTimer <= 0}
                      className="h-13 w-11 sm:h-14 sm:w-13 text-center text-xl sm:text-2xl font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none transition-all duration-200 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/15 disabled:bg-slate-100 disabled:opacity-60"
                    />
                  ))}
                </div>

                {/* Resend Option with Rate Limiting */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <RotateCw size={13} className={loading ? "animate-spin" : ""} />
                    {resendCooldown > 0 ? (
                      <span>Resend code in {resendCooldown}s</span>
                    ) : (
                      <span>Resend code</span>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6 || otpTimer <= 0}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              STEP 3: SET NEW PASSWORD
          ========================================================= */}
          {step === "new-password" && (
            <motion.div
              key="step-new-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Set New Password
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Your code has been verified. Create a strong, unique password for your MedCare account.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="mt-7 space-y-4">
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <LockKeyhole size={18} />
                    </div>

                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <LockKeyhole size={18} />
                    </div>

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      minLength={6}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Validation Checklist */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      newPassword.length >= 6 ? "text-teal-700 font-medium" : "text-slate-400"
                    }`}
                  >
                    <CheckCircle2 size={13} className={newPassword.length >= 6 ? "text-teal-600" : "text-slate-300"} />
                    <span>At least 6 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      confirmPassword && newPassword === confirmPassword
                        ? "text-teal-700 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    <CheckCircle2
                      size={13}
                      className={
                        confirmPassword && newPassword === confirmPassword
                          ? "text-teal-600"
                          : "text-slate-300"
                      }
                    />
                    <span>Passwords match</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              STEP 4: SUCCESS CONFIRMATION
          ========================================================= */}
          {step === "success" && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-4 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 shadow-md shadow-teal-600/10">
                <CheckCircle2 size={36} strokeWidth={2.3} />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Password Reset Successful
              </h2>

              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Your MedCare account password has been updated securely. A confirmation receipt has been sent to your email.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/login", { replace: true })}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-md shadow-teal-700/20 hover:bg-teal-700 hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Compliance & Security Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>256-bit SSL encrypted & HIPAA compliant health data</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
