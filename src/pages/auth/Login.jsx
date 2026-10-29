import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeftIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slice/authSlice";
import { motion } from "framer-motion";
import { connectSocket } from "../../socket/socket";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

      const response = await loginUser(formData);

      console.log("Login successful:", response);

      dispatch(setUser(response.user));
      connectSocket();

      if (response.user.role === "patient") {
        navigate("/patient");
      } else if (response.user.role === "doctor") {
        navigate("/doctor");
      } else if (response.user.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] p-4 sm:p-6 lg:p-10">
      {/* =====================================================
          SUBTLE AMBIENT HEALTHCARE BACKGROUND
      ====================================================== */}
       <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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
          MAIN LOGIN CONTAINER (TWO-COLUMN DESKTOP CARD)
      ====================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden   rounded-3xl  bg-white  lg:flex-row"
      >
        {/* =====================================================
            LEFT SIDE: HEALTHCARE VISUAL AREA
        ====================================================== */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden p-10 xl:p-12 text-white">
          {/* Clinical Doctor Image with Professional Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/imgi_4_pexels-photo-7578797.jpg"
              alt="Medical consultation at MedCare clinic"
              className="h-full w-full object-cover object-top"
            />
            {/* Deep medical teal to dark slate gradient overlay for contrast and calm */}
            <div className="absolute inset-0 bg-linear-to-t from-[#041a1c]/95 via-[#06292c]/75 to-[#041a1c]/45" />
            <div className="absolute inset-0 bg-[#0f766e]/20 mix-blend-multiply" />
          </div>

          {/* Left Top: MedCare Brand Logo & Trust Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2">
                      {/* <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" /> */}
                      <p className="text-white flex items-center hover:text-teal-300 transition-colors">
                        <ArrowLeftIcon size={20} />  Back to home
                      </p>
                    </Link>

            
          </div>

          {/* Left Middle: Headline & Subtle Supporting Copy */}
          <div className="relative z-10 my-auto py-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/15 px-3.5 py-1 text-xs font-medium text-teal-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Unified Clinical Platform
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl leading-[1.2]">
              Your Health, <br />
              <span className="text-teal-300">Our Priority.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200/90">
              Connecting patients, licensed specialists, and medical workflows on
              one calm, secure digital platform.
            </p>

            {/* Credibility highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={15} className="text-teal-300 shrink-0" />
                  <span>24/7 Clinical Access</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Instant consults & records
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={15} className="text-teal-300 shrink-0" />
                  <span>Verified Doctors</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Top medical specialists
                </p>
              </div>
            </div>
          </div>

          {/* Left Bottom: Subtle Professional Footnote */}
          <div className="relative z-10 border-t border-white/15 pt-4">
            <p className="text-xs text-slate-300">
              “Modern healthcare built on security, precision, and patient-first care.”
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE: CLEAN LOGIN FORM
        ====================================================== */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-14">
          {/* Mobile Header with Logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
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
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your healthcare dashboard.
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* EMAIL INPUT */}
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
                  placeholder="name@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "To reset your password, please check your inbox for instructions or contact support@medcare.com"
                    );
                  }}
                  className="text-xs font-medium text-teal-700 transition-colors hover:text-teal-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <LockKeyhole size={18} />
                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* PRIMARY SIGN IN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* REGISTER LINK */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline"
            >
              Create account
            </Link>
          </p>

          {/* COMPLIANCE & SECURITY FOOTER */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>256-bit SSL encrypted & HIPAA compliant health data</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;