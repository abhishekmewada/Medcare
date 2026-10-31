import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  LayoutGrid,
  Calendar,
  CalendarPlus,
   Pill,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slice/authSlice";
import { logoutUser } from "../../services/auth.service";
import PatientNotification from "./PatientNotification";

const PatientNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const menuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Active tab syncing with pathname
  useEffect(() => {
    const path = location.pathname;
    if (path === "/patient" || path === "/patient/") {
      setActiveTab("overview");
    } else if (path.includes("/appointments")) {
      setActiveTab("appointments");
    } else if (path.includes("/doctors")) {
      setActiveTab("book-visit");
    } else if (path.includes("/medical-records")) {
      setActiveTab("medical-records");
    } else if (path.includes("/prescriptions")) {
      setActiveTab("prescriptions");
    } else if (path.includes("/messages")) {
      setActiveTab("messages");
    } else if (path.includes("/symptoms")) {
      setActiveTab("symptoms");
    } else if (path.includes("/profile")) {
      setActiveTab("profile");
    }
  }, [location.pathname]);

  // Scroll and outside click listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isOpen) setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
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

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    setIsOpen(false);
    navigate(item.path);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/#", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <header className="  fixed top-4 md:top-6 left-0 w-full z-50 px-4 transition-all duration-400">
      <div className="  max-w-7xl mx-auto  " ref={menuRef}>
        {/* Main Floating Pill Nav */}
        <nav
          className={`h-16 scale-80 group hover:scale-85 transition-all duration-400 md:h-18 bg-white/25 backdrop-blur-xl border border-white/40 rounded-full  px-4 sm:px-6 py-2.5 flex items-center justify-between  ${
            scrolled ? "shadow-lg bg-white/50 border-slate-200/60" : ""
          }`}
        >
          {/* Logo */}
          <div
            onClick={() => {
              setActiveTab("overview");
              navigate("/patient");
            }}
            className="flex items-center hover:opacity-90  gap-3 cursor-pointer select-none transition-transform hover:scale-[1.02] shrink-0"
          >
             <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" />
          </div>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-1 lg:gap-1.5 mx-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/patient"}
                  onClick={() => handleNavigation(item)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-md group-hover:text-sm font-semibold transition-all duration-200 cursor-pointer ${
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
          <div className="flex items-center gap-2 sm:gap-3">
         <PatientNotification />
            {/* Desktop User Chip & Logout */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200/80">
              <div
                onClick={() => {
                  setActiveTab("profile");
                  navigate("/patient/profile");
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <span className="text-sm max-w-21.5 font-semibold text-slate-700  truncate">
                  {user?.fullName?.split(" ")[0] || "Patient"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
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
              className={`lg:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 border cursor-pointer ${
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
          <div className="mx-auto absolute md:right-32 right-9 mt-2 md:max-w-xs place-items-start overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Chip */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 cursor-pointer transition-colors mb-2"
              onClick={() => {
                setActiveTab("profile");
                navigate("/patient/profile");
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                {user?.fullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <span className="text-sm font-semibold text-slate-700 truncate">
                {user?.fullName?.split(" ")[0] || "Patient"}
              </span>
            </div>
            <nav className="flex flex-col space-y-1">
              {menuItems.map(({ path, label, icon: Icon, id }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/patient"}
                  onClick={() => {
                    handleNavigation({ id, path });
                    setMobileMenuOpen(false);
                  }}
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
      </div>
    </header>
  );
};

export default PatientNavbar;