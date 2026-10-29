import  { useState, useEffect, useRef } from "react";
import {
   Home,
  Stethoscope,
  Users,
   HelpCircle,
  Menu,
  X,
  LogIn,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const navLinks = [
    {
      name: "Home",
      href: "#",
      icon: Home,
      description: "Overview & health dashboard",
    },
    {
      name: "Services",
      href: "#services",
      icon: Stethoscope,
      description: "Specialized clinical care & AI triage",
    },
    {
      name: "Doctors",
      href: "#doctors",
      icon: Users,
      description: "Verified specialists & availability",
    },
    // {
    //   name: "Pricing",
    //   href: "#pricing",
    //   icon: CreditCard,
    //   description: "Transparent patient & family plans",
    // },
    {
      name: "FAQ",
      href: "#faq",
      icon: HelpCircle,
      description: "Common questions & support",
    },
  ];

  // Close menu on scroll or outside click
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
    <header className="fixed top-4 md:top-6 left-0 w-full z-50 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto " ref={menuRef}>
        {/* Main Floating Pill Nav */}
        <nav
          className={`h-16 group md:h-18 bg-blue-500/10 backdrop-blur-xl  border border-white/20 scale-80 hover:scale-85  rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${
            scrolled ? "shadow-lg bg-white/50" : ""
          }`}
        >
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group select-none transition-transform hover:scale-[1.02]"
          >
           <img className="object-contain bg-transparent mix-blend-multiply contrast-125 brightness-105 " src="/images/Gemini_Generated_Image_6t88pq6t88pq6t88-removebg-preview.png" height="auto" width="180" alt="logo" />

          </a>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex  mx-2 items-center gap-2 lg:gap-4">
            {navLinks.map((item) => {
              // const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex  items-center  px-3 py-2 transition duration-500 text-lg group-hover:text-md font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50/80 rounded-xl "
                  >
                    {/* <Icon size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> */}
                    <span>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right Side (Desktop CTAs & Mobile Hamburger Toggle) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href="/login"
                className="text-md font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors"
              >
                Sign in
              </a>

              <a
                href="/register"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2 rounded-full text-md font-semibold transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35"
              >
                <span >Get Started </span>
                <ArrowRight size={15} />  
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className={`md:hidden flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 border cursor-pointer ${
                isOpen
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 rotate-90"
                  : "bg-slate-100/90 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
              }`}
            >
              {isOpen ? (
                <X size={20} strokeWidth={2.3} />
              ) : (
                <Menu size={20} strokeWidth={2.3} />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Responsive Dropdown Menu (Premium Card Overlay) */}
        {isOpen && (
          <div className="md:hidden   mt-3 w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            {/* Header in Menu */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Navigation Menu
                </span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Connected Care
              </span>
            </div>

            {/* Mobile Nav Links List */}
            <div className="space-y-1.5 py-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
                        <Icon size={19} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Mobile Footer CTAs (Sign In & Get Started) */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <a
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-3 px-4 rounded-2xl text-sm font-semibold shadow-md shadow-blue-600/25 transition-all"
              >
                <Sparkles size={16} />
                <span>Get Started</span>
                <ArrowRight size={15} />
              </a>

              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-2.5 px-4 rounded-2xl text-sm font-medium transition-colors border border-slate-200/80"
              >
                <LogIn size={16} />
                <span>Sign in to Account</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
