import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Notification from "../../components/doctor/Notification";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CalendarDays,
  Users,
   BarChart3,
  LogOut,
  X,
  Menu,
  ClipboardList,
} from "lucide-react";

import { logout } from "../../redux/slice/authSlice";
// import { setSidebarOpen } from "../../redux/slice/uiSlice";

const NAV_ITEMS = [
  { to: "/doctor", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/doctor/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  // { to: "/doctor/prescriptions/new", label: "Write prescription", icon: FileEdit },
  { to: "/doctor/prescriptions", label: "Prescriptions", icon: ClipboardList },
  { to: "/doctor/analytics", label: "Analytics", icon: BarChart3 },
  // { to: "/doctor/profile", label: "Profile", icon: UserCircle },
];

const DoctorSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doctor = useSelector((state) => state.auth.user);
  // const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);
  

  const handleLogout = () => {
    dispatch(logout());
  };

  const doctorName = doctor?.fullName || doctor?.name || "Doctor";
  const initial =
    doctorName
      .replace("Dr. ", "")
      .trim()
      .charAt(0)
      .toUpperCase() || "D";

      // scrolled
       useEffect(() => {
          const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            if (isOpen) setIsOpen(false);
          };
      
          const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
              setIsOpen(false);
            }
          };
      
          const handleEscape = (e) => {
            if (e.key === "Escape") setIsOpen(false);
          };
      
          window.addEventListener("scroll", handleScroll);
          document.addEventListener("mousedown", handleClickOutside);
          document.addEventListener("keydown", handleEscape);
      
          return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
          };
        }, [isOpen]);

  return (
    <header   className="fixed   md:top-4  left-0 w-full z-50 px-4 lg:px-1 transition-all duration-400">
      {/* ── FLOATING PILL NAVBAR (Image Jaisa Exact Design) ── */}
      <div ref={menuRef} className={`h-16  max-w-7xl mx-auto scale-85  md:scale-80 group hover:scale-85 md:hover:scale-85 transition-all duration-400 md:h-18 bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40  rounded-full  px-4 sm:px-6 py-2.5 flex items-center justify-between  ${
            scrolled ? "shadow-lg bg-white/50 border-slate-200/60" : ""
          }`}>
        
        {/* 1. LOGO */}
        <Link to="/doctor" className="flex items-center gap-2.5">
         {/* Logo */}
          <div
            onClick={() => {
              // setActiveTab("overview");
              navigate("/patient");
            }}
            className="flex items-center hover:opacity-90  gap-3 cursor-pointer select-none transition-transform hover:scale-[1.02] shrink-0"
          >
             <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" />
          </div>
        </Link>

        {/* 2. DESKTOP NAVIGATION LINKS */}
        <nav className="hidden   px-4 py-1 items-center gap-1 xl:gap-2 lg:flex">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-md group-hover:text-sm font-medium transition-all duration-150 ${
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Vertical Divider (Image Jaisa) */}
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />

          {/* Notification Bell */}
          <Notification />

          {/* Doctor Profile Chip */}
          <Link
            to="/doctor/profile"
            className="hidden md:flex  items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/70 py-1 pl-1 pr-3 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-2xs">
             {initial}
            </div>
            <span className="max-w-21.25 capitalize  truncate text-md group-hover:text-sm font-semibold text-slate-800 sm:max-w-30">
              {doctorName.toLowerCase()}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className=" hidden md:flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
        <div className="mx-auto  absolute  md:right-32 right-9 mt-2 md:max-w-xs  place-items-start overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
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

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default DoctorSidebar;