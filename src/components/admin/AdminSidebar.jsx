import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutGrid,
  Stethoscope,
  Users,
  CalendarCheck,
  BarChart3,
  ShieldAlert,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  User,
  ChevronDown,
  Unlock,
} from "lucide-react";

import { logout } from "../../redux/slice/authSlice";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/patients", label: "Patients", icon: Users },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit-logs", label: "Audit Trail", icon: ShieldAlert },
  { to: "/admin/chat", label: "Chat Oversight", icon: MessageSquare },
];

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const { pendingDoctorsCount } = useSelector(
    (state) => state.admin?.dashboard || {}
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const adminName = user?.fullName || "System Admin";
  const adminEmail = user?.email || "admin@medcare.com";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-3 sm:px-6 pt-3 transition-all duration-300">
      <div
        ref={menuRef}
        className={`max-w-7xl mx-auto h-16 sm:h-20 bg-[#1f363d]/95 backdrop-blur-xl border border-[#40798c]/30 rounded-2xl px-4 sm:px-6 flex items-center justify-between text-white transition-all duration-300 ${
          scrolled ? "shadow-2xl shadow-[#1f363d]/20 border-[#70a9a1]/40" : "shadow-lg shadow-[#1f363d]/10"
        }`}
      >
        {/* 1. BRAND LOGO */}
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#40798c] to-[#70a9a1] text-white shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                MedCare
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-[#70a9a1]/20 text-[#70a9a1] border border-[#70a9a1]/30 rounded-full uppercase">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
              Control & Governance Console
            </p>
          </div>
        </Link>

        {/* 2. DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#17282e]/80 p-1.5 rounded-xl border border-white/10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#40798c] text-white shadow-md shadow-[#40798c]/30"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.label === "Doctors" && pendingDoctorsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-900 font-extrabold text-[10px] rounded-full animate-pulse">
                    {pendingDoctorsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* 3. RIGHT PROFILE & ACTIONS */}
        <div className="flex items-center gap-3">
          {/* Doctor Pending Alert Pill */}
          {pendingDoctorsCount > 0 && (
            <Link
              to="/admin/doctors?tab=pending"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-xl hover:bg-amber-500/30 transition-colors"
            >
              <Bell size={14} className="animate-bounce text-amber-400" />
              <span>{pendingDoctorsCount} pending approval</span>
            </Link>
          )}

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-[#40798c] flex items-center justify-center text-white font-bold text-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight text-white">
                  {adminName}
                </p>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Super Administrator
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1f363d] border border-[#40798c]/40 rounded-xl shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white">{adminName}</p>
                  <p className="text-[11px] text-slate-300 truncate">{adminEmail}</p>
                </div>
                <div className="py-1">
                  <div className="px-4 py-1 text-[11px] font-semibold text-[#70a9a1] uppercase tracking-wider">
                    Role: Administrator
                  </div>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors text-left"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#1f363d] border border-[#40798c]/40 rounded-2xl p-4 shadow-2xl space-y-2 animate-in slide-in-from-top-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#40798c] text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.label === "Doctors" && pendingDoctorsCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-900 font-bold text-xs rounded-full">
                    {pendingDoctorsCount} pending
                  </span>
                )}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-300 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
