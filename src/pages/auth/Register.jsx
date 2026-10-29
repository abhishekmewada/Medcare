import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  UserRound,
  Stethoscope,
  Mail,
  LockKeyhole,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeftIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, verifyEmail } from "../../services/auth.service";
import { AnimatePresence, motion } from "framer-motion";

const Register = () => {
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [otp, setOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    specialty: "",
    experience: "",
    qualification: "",
    about: "",
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = {
        ...formData,
        role,
      };

      const response = await registerUser(data);

      console.log("Register response", response);

      // Assume backend sends verification token via email
      setStep('verify');
      // Optionally, you could store the email for reference

    } catch (err) {
      console.error("Register error:", err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden p-4 sm:p-6 lg:p-10">
      {/* =====================================================
          FULL-SCREEN BACKGROUND IMAGE WITH PROFESSIONAL OVERLAY
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        {/* Full Background Image */}
        <img
          src="/images/circle-scatter-haikei.png"
          alt="MedCare Background"
          className="h-full w-full object-cover object-center"
        />

        {/* Cinematic Dual-Tone Medical Overlay (ensures card contrast) */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-linear-to-tr from-teal-950/60 via-slate-900/30 to-sky-950/40 mix-blend-multiply" />

        {/* Ambient Glow Accents */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-teal-400/20 blur-[130px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-[140px]" />
      </div>

      {/* =====================================================
          MAIN REGISTER CONTAINER (TWO-COLUMN DESKTOP CARD)
      ====================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl  bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-950/30 lg:flex-row"
      >
        {/* =====================================================
            LEFT SIDE: HEALTHCARE VISUAL AREA
        ====================================================== */}
        <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between overflow-hidden p-10 xl:p-12 text-white">
          {/* Professional Doctor Consultation Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/imgi_2_pexels-photo-7579823.jpg"
              alt="Medical doctor consultation at MedCare"
              className="h-full w-full object-cover object-center"
            />
            {/* Deep medical teal to dark slate gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-[#041a1c]/95 via-[#06292c]/85 to-[#041a1c]/50" />
            <div className="absolute inset-0 bg-[#0f766e]/20 mix-blend-multiply" />
          </div>

          {/* Left Top: Logo & Trust Tag */}
          <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
                      {/* <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" /> */}
                      <p className="text-white flex items-center hover:text-teal-300 transition-colors">
                        <ArrowLeftIcon size={20} />  Back to home
                      </p>
                    </Link>

             
          </div>

          {/* Left Middle: Headline & Supporting Copy */}
          <div className="relative z-10 my-auto py-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/15 px-3.5 py-1 text-xs font-medium text-teal-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Join the MedCare Network
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl leading-[1.2]">
              Care That Puts <br />
              <span className="text-teal-300">You First.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200/90">
              Create your account to consult licensed clinicians, manage health
              records, and schedule appointments effortlessly.
            </p>

            {/* Credibility highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={15} className="text-teal-300 shrink-0" />
                  <span>Verified Specialists</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Certified healthcare providers
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={15} className="text-teal-300 shrink-0" />
                  <span>Secure Records</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  End-to-end encrypted health data
                </p>
              </div>
            </div>
          </div>

          {/* Left Bottom: Subtle Professional Footnote */}
          <div className="relative z-10 border-t border-white/15 pt-4">
            <p className="text-xs text-slate-300">
              “Trusted by patients and doctors across the country for modern care.”
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE: CLEAN REGISTER FORM
        ====================================================== */}
        <div className="flex w-full lg:w-7/12 flex-col justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-14">
          {/* Mobile Header with Logo */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MedCare
              </span>
            </Link>

            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <ShieldCheck size={13} />
              Secure
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Start managing your healthcare journey in one secure place.
            </p>
          </div>

          {/* Role Selector: Patient or Doctor */}
          <div className="mt-6 relative p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex gap-2">
            {/* Smooth Sliding Active Background Indicator */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-7px)] rounded-xl bg-white dark:bg-slate-900 border border-teal-500/40 shadow-md shadow-teal-900/5 transition-all duration-300 ease-in-out ${
                role === "patient" ? "left-1.5" : "left-[calc(50%+3.5px)]"
              }`}
            />

            {/* 1. Patient Button */}
            <button
              type="button"
              onClick={() => setRole("patient")}
              className="relative z-10 flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-xl transition-transform duration-150 active:scale-95 text-left cursor-pointer"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all duration-300 ${
                  role === "patient"
                    ? "bg-teal-600 text-white scale-110 shadow-sm shadow-teal-600/30"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 scale-100"
                }`}
              >
                <UserRound size={16} className={`transition-transform duration-300 ${role === "patient" ? "scale-105" : ""}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold transition-colors duration-200 ${
                  role === "patient" ? "text-teal-950 dark:text-teal-200 font-extrabold" : "text-slate-600 dark:text-slate-400"
                }`}>
                  Patient
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Personal care</p>
              </div>

              <div
                className={`transition-all duration-300 transform ${
                  role === "patient"
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-50 rotate-45 pointer-events-none"
                }`}
              >
                <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
            </button>

            {/* 2. Doctor Button */}
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className="relative z-10 flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-xl transition-transform duration-150 active:scale-95 text-left cursor-pointer"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all duration-300 ${
                  role === "doctor"
                    ? "bg-teal-600 text-white scale-110 shadow-sm shadow-teal-600/30"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 scale-100"
                }`}
              >
                <Stethoscope size={16} className={`transition-transform duration-300 ${role === "doctor" ? "scale-105" : ""}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold transition-colors duration-200 ${
                  role === "doctor" ? "text-teal-950 dark:text-teal-200 font-extrabold" : "text-slate-600 dark:text-slate-400"
                }`}>
                  Doctor
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Clinical care</p>
              </div>

              <div
                className={`transition-all duration-300 transform ${
                  role === "doctor"
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-50 rotate-45 pointer-events-none"
                }`}
              >
                <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
            </button>
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          {step === 'register' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* FULL NAME */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserRound size={18} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder={role === "doctor" ? "Dr. Alex Johnson" : "Alex Johnson"}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Email address
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
            </div>

            {/* PASSWORD & PHONE GRID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <LockKeyhole size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Phone number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 000-0000"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                  />
                </div>
              </div>
            </div>

            {/* CONDITIONAL DOCTOR SPECIALTY */}
            <AnimatePresence>
              {role === "doctor" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <label
                      htmlFor="specialty"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      Medical specialty
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-teal-600">
                        <Stethoscope size={18} />
                      </div>
                      <input
                        id="specialty"
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        required={role === "doctor"}
                        placeholder="e.g. Cardiologist, Neurologist, Pediatrician"
                        className="h-12 w-full rounded-xl border border-teal-200 bg-teal-50/40 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-teal-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PRIMARY SUBMIT BUTTON */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create your account</span>
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>) }

          {/* LOGIN LINK */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* COMPLIANCE & SECURITY FOOTER */}
{step === 'verify' && (
  <div className="mt-8 text-center">
    <h2 className="text-2xl font-bold text-teal-600 mb-4">Enter Verification Code</h2>
    <p className="text-sm text-slate-600 mb-4">We sent a 6‑digit code to your email. Please enter it below.</p>
    <input
      type="text"
      maxLength={6}
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      placeholder="123456"
      className="h-12 w-48 mx-auto text-center rounded-xl border border-teal-300 bg-teal-50/20 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
    />
    {verificationError && (
      <p className="mt-2 text-rose-600 text-sm">{verificationError}</p>
    )}
    <button
      onClick={async () => {
        try {
          setVerificationError('');
          const res = await verifyEmail(otp);
          navigate('/login');
        } catch (err) {
          console.error('Verification error', err);
          setVerificationError(err.response?.data?.message || 'Invalid verification code');
        }
      }}
      disabled={otp.length !== 6}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Verify Email
    </button>
  </div>
)}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>256-bit SSL encrypted &amp; HIPAA compliant health data</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;