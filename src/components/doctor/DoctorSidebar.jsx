import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Notification from "../../components/doctor/Notification";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import useLogout from "../../hooks/useLogout";
import {
  LayoutGrid,
  CalendarDays,
  Users,
   BarChart3,
  LogOut,
   X,
  Menu,
  ClipboardList,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/doctor", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/doctor/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  // { to: "/doctor/prescriptions/new", label: "Write prescription", icon: FileEdit },
  { to: "/doctor/prescriptions", label: "Prescriptions", icon: ClipboardList },
  { to: "/doctor/analytics", label: "Analytics", icon: BarChart3 },
];

const DoctorSidebar = () => {

  const doctor = useSelector((state) => state.auth.user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);
  

  const {
    isOpen: logoutModalOpen,
    loading: isLoggingOut,
    requestLogout,
    cancelLogout,
    confirmLogout,
  } = useLogout();

  const doctorName = doctor?.fullName || doctor?.name || "Doctor";
  const initial =
    doctorName.replace("Dr. ", "").trim().charAt(0).toUpperCase() || "D";

      // scrolled
       useEffect(() => {
          const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            if (mobileMenuOpen) setMobileMenuOpen(false);
          };
      
          const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
              setMobileMenuOpen(false);
            }
          };
      
          const handleEscape = (e) => {
            if (e.key === "Escape") setMobileMenuOpen(false);
          };
      
          window.addEventListener("scroll", handleScroll);
          document.addEventListener("mousedown", handleClickOutside);
          document.addEventListener("keydown", handleEscape);
      
          return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
          };
        }, [mobileMenuOpen]);

  return (
    <header ref={menuRef} className="fixed md:top-4 left-0 z-50 w-full px-4 transition-all duration-400 lg:px-1">
      {/* ── FLOATING PILL NAVBAR (Image Jaisa Exact Design) ── */}
      <div className={`h-16 max-w-7xl mx-auto scale-85 md:scale-80 group hover:scale-85 md:hover:scale-85 transition-all duration-400 md:h-18 bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-full px-3 sm:px-5 lg:px-6 py-2.5 flex items-center justify-between ${
            scrolled ? "shadow-lg bg-white/50 border-slate-200/60" : ""
          }`}>
        
        {/* 1. LOGO */}
        <Link to="/doctor" className="flex items-center gap-2.5">
         {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none transition-transform hover:scale-[1.02] shrink-0"
          >
             <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" />
          </div>
        </Link>

        {/* 2. DESKTOP NAVIGATION LINKS */}
        <nav className="hidden px-1 py-1 items-center gap-0.5 xl:gap-1 lg:flex">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-2.5 py-1.5 text-md xl:px-3 xl:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 font-bold text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

      

        {/* 3. RIGHT SECTION: USER BADGE & LOGOUT */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Vertical Divider (Image Jaisa) */}
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />

          {/* Notification Bell */}
          <Notification />

          {/* Doctor Profile Chip */}
          <Link
            to="/doctor/profile"
            className="hidden md:flex min-w-0 items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/70 py-1 pl-1 pr-2.5 transition-colors hover:bg-slate-100 lg:pr-3"
            aria-label={`Open ${doctorName}'s profile`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-2xs">
              {initial}
            </span>
            <span className="max-w-16 truncate text-xs font-semibold capitalize text-slate-800 xl:max-w-28 xl:text-sm">
              {doctorName.toLowerCase()}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={requestLogout}
            title="Sign Out"
            className=" hidden md:flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          >
            <LogOut size={16} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE RESPONSIVE DROPDOWN (Pill-Styled) ── */}
      {mobileMenuOpen && (
        <div className="absolute right-4 sm:right-6 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/doctor/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <UserCircle size={16} />
              <span>Profile</span>
            </NavLink>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  requestLogout();
                }}
                className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <ConfirmationModal
        isOpen={logoutModalOpen}
        isLoading={isLoggingOut}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to login again to access your doctor dashboard."
        confirmLabel="Confirm Logout"
        cancelLabel="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </header>
  );
};

export default DoctorSidebar;