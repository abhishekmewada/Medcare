import { useState, useEffect, useRef } from "react";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import useLogout from "../../hooks/useLogout";
import { NavLink } from "react-router-dom";
import { Activity, LayoutGrid, Calendar, CalendarPlus, Pill, LogOut, Menu, User, X } from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



// Duplicate import removed
import PatientNotification from "./PatientNotification";

const PatientNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isOpen: logoutModalOpen,
    loading: isLoggingOut,
    requestLogout,
    cancelLogout,
    confirmLogout,
  } = useLogout();


  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Close the mobile menu on scroll, outside interaction, or Escape.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setMobileMenuOpen(false);
    };

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutGrid,
      path: "/patient",
      description: "Health dashboard & vitals",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      path: "/patient/appointments",
      description: "Scheduled & past consultations",
    },
    {
      id: "book-visit",
      label: "Book Visit",
      icon: CalendarPlus,
      path: "/patient/doctors",
      description: "Find doctors & book slots",
    },
    // {
    //   id: "medical-records",
    //   label: "Records",
    //   icon: FileText,
    //   path: "/patient/medical-records",
    //   description: "Lab results & medical reports",
    // },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: Pill,
      path: "/patient/prescriptions",
      description: "Active medication & refills",
    },
    // {
    //   id: "messages",
    //   label: "AI Assistant",
    //   icon: Bot,
    //   path: "/patient/messages",
    //   description: "24/7 intelligent health triage",
    // },
    {
      id: "symptoms",
      label: "Symptoms",
      icon: Activity,
      path: "/patient/symptoms",
      description: "Instant clinical symptom checker",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/patient/profile",
      description: "Personal & emergency details",
    },
  ];


  return (
    <header className="fixed left-0 top-4 z-50 w-full px-3 transition-all duration-400 sm:px-4 md:top-6">
      <div className="relative mx-auto max-w-7xl" ref={menuRef}>
        {/* Main Floating Pill Nav */}
        <nav
          className={`h-16 scale-90 group hover:scale-95 transition-all duration-400 sm:scale-85 sm:hover:scale-90 xl:scale-80 xl:hover:scale-85 md:h-18 bg-white/25 backdrop-blur-xl border border-white/40 rounded-full px-3 sm:px-5 xl:px-6 py-2.5 flex items-center justify-between ${
            scrolled ? "shadow-lg bg-white/50 border-slate-200/60" : ""
          }`}
        >
          {/* Logo */}
          <div
            onClick={() => navigate("/patient")}
            className="flex shrink-0 cursor-pointer select-none items-center gap-3 transition-transform hover:scale-[1.02] hover:opacity-90"
          >
             <img className="w-32 object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 sm:w-36 xl:w-40" src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="MedCare" />
          </div>

          {/* Desktop Navigation Links */}
          <ul className="mx-1 hidden items-center gap-0.5 lg:flex 2xl:mx-2 2xl:gap-1.5">
            {menuItems.map((item) => {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/patient"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all duration-200 2xl:px-3 2xl:text-sm ${
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-xs border border-blue-100/60"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50/80"
                    }`}
                >
                  
                    <span>{item.label}</span>
                  
                </NavLink>
              );
            })}
          </ul>

          {/* Right Side (User Chip & Logout / Mobile Toggle) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
         <PatientNotification />
            {/* Desktop User Chip & Logout */}
            <div className="hidden items-center gap-2 border-l border-slate-200/80 pl-2 md:flex">
              <div
                onClick={() => {
                  navigate("/patient/profile");
                }}
                className=" hidden lg:hidden md:flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50 px-2.5 py-1.5 transition-colors hover:bg-slate-100"
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <span className="max-w-24 truncate text-sm font-semibold text-slate-700">
                  {user?.fullName?.split(" ")[0] || "Patient"}
                </span>
              </div>

              <button
                type="button"
                onClick={requestLogout}
                title="Sign out"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-transparent text-slate-500 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className={`flex lg:hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 xl:hidden sm:h-11 sm:w-11 ${
                mobileMenuOpen
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 rotate-90"
                  : "bg-slate-100/90 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
              }`}
            >
              {mobileMenuOpen ? (
                <X size={20} strokeWidth={2.3} />
              ) : (
                <Menu size={20} strokeWidth={2.3} />
              )}
            </button>
          </div>
        </nav>

                {/* Mobile Responsive Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md xl:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            <nav className="flex flex-col space-y-1">
              {menuItems.map(({ path, label, icon: Icon, }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/patient"}
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
      </div>

      <ConfirmationModal
        isOpen={logoutModalOpen}
        isLoading={isLoggingOut}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to login again to access your patient dashboard."
        confirmLabel="Confirm Logout"
        cancelLabel="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </header>
  );
};

export default PatientNavbar;