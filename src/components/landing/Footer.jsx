import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ChevronRight,
  ArrowUp,
  Lock,
  Sparkles,
} from "lucide-react";
// import { motion } from "motion/react";
import {motion} from "framer-motion";

// Crisp, authentic Social Media SVGs
const SocialTwitter = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SocialLinkedin = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const SocialGithub = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const SocialYoutube = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Footer({
  theme = "light", // "dark" | "light"
  onNavigate = undefined,
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeToast, setActiveToast] = useState("");

  const isDark = theme === "dark";

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3500);
    setEmail("");
  };

  const handleLinkClick = (name) => {
    if (onNavigate) {
      onNavigate(name);
    } else {
      setActiveToast(`Navigating to: ${name}`);
      setTimeout(() => setActiveToast(""), 2500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Structured navigation with the user's exact columns & items + subtle enhancement tags
  const navColumns = [
    {
      title: "Product",
      links: [
        { name: "Features" },
        { name: "Pricing" },
        { name: "Security" },
        { name: "AI Assistant", badge: "New", isNew: true },
        { name: "Integrations" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About" },
        { name: "Blog" },
        { name: "Careers", badge: "Hiring", isHiring: true },
        { name: "Contact" },
        { name: "Press Kit" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Docs" },
        { name: "Help Center" },
        { name: "Privacy" },
        { name: "Terms" },
        { name: "System Status", badge: "Operational", statusDot: true },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: SocialTwitter,
      aria: "Follow MedCare on X",
      hoverClass: "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700",
    },
    {
      name: "LinkedIn",
      icon: SocialLinkedin,
      aria: "Connect on LinkedIn",
      hoverClass: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
    {
      name: "GitHub",
      icon: SocialGithub,
      aria: "View GitHub Repository",
      hoverClass: "hover:bg-slate-950 hover:text-white hover:border-slate-800",
    },
    {
      name: "YouTube",
      icon: SocialYoutube,
      aria: "Watch on YouTube",
      hoverClass: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
    },
  ];

  return (
    <footer
      className={`relative w-full overflow-hidden transition-colors duration-300 font-sans ${
        isDark
          ? "bg-[#0B101B] text-slate-300 border-t border-slate-800/80"
          : "bg-slate-50 text-slate-600 border-t border-slate-200"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={`absolute -top-32 left-1/4 h-80 w-80 rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-blue-600" : "bg-blue-300"
          }`}
        />
        <div
          className={`absolute -bottom-32 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-15 ${
            isDark ? "bg-cyan-500" : "bg-cyan-200"
          }`}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-12">
        {/* Newsletter / Clinical Updates Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`mb-16 rounded-2xl p-6 sm:p-7 border transition-all ${
            isDark
              ? "bg-slate-900/60 border-slate-800/90 shadow-xl shadow-black/20"
              : "bg-white border-slate-200/90 shadow-xs"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-cyan-400" : "text-blue-600"
                  }`}
                >
                  Clinical Newsletter
                </span>
              </div>
              <h3
                className={`text-xl font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Get the latest updates on AI in healthcare
              </h3>
              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No spam, just clinical breakthroughs, algorithm approvals, and product releases.
              </p>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative min-w-70">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  required
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border transition-all ${
                    isDark
                      ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-600/30 active:scale-[0.98] cursor-pointer shrink-0"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Middle: Brand + Navigation Columns */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 pb-14 border-b border-slate-200 dark:border-slate-800/80">
          {/* Logo & Brand Details */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                <Activity size={22} className="text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  MedCare
                </h2>
                <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  AI
                </span>
              </div>
            </div>

            <p
              className={`mt-5 text-sm leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              The all-in-one AI healthcare platform trusted by modern clinics
              and hospitals worldwide.
            </p>

            {/* Compliance trust marks */}
            <div className="mt-5 flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium border ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>HIPAA</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium border ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>SOC 2</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium border ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ISO 27001</span>
              </span>
            </div>

            {/* Clearly defined Social Media Icons */}
            <div className="mt-7">
              <span
                className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                Follow our updates
              </span>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={social.name}
                      onClick={() => handleLinkClick(social.name)}
                      aria-label={social.aria}
                      title={social.name}
                      className={`group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                        isDark
                          ? "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
                      } ${social.hoverClass} hover:scale-105 active:scale-95`}
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Columns: Product, Company, Resources */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:max-w-2xl lg:ml-auto">
            {navColumns.map((col, idx) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="flex flex-col text-left"
              >
                {/* Column Heading */}
                <h3
                  className={`mb-5 text-xs font-bold uppercase tracking-[2px] ${
                    isDark ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  {col.title}
                </h3>

                {/* Navigation Items with Subtle Hover Effect */}
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => handleLinkClick(link.name)}
                        className={`group flex items-center gap-1.5 text-left text-sm transition-all duration-200 cursor-pointer py-0.5 ${
                          isDark
                            ? "text-slate-400 hover:text-white hover:translate-x-1"
                            : "text-slate-600 hover:text-blue-600 hover:translate-x-1"
                        }`}
                      >
                        {/* Subtle Chevron indicator revealed on hover */}
                        <ChevronRight
                          className={`w-3.5 h-3.5 opacity-0 -ml-3.5 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0 ${
                            isDark ? "text-cyan-400" : "text-blue-600"
                          }`}
                        />

                        <span>{link.name}</span>

                        {link.isNew && (
                          <span className="ml-1.5 rounded-full bg-blue-500/15 px-2 py-0.2 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            {link.badge}
                          </span>
                        )}

                        {link.isHiring && (
                          <span className="ml-1.5 rounded-full bg-emerald-500/15 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {link.badge}
                          </span>
                        )}

                        {link.statusDot && (
                          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {link.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright, System Status, Legal & Back to Top */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-around gap-4 text-xs">
          {/* Copyright & Live System Status */}
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <span className={isDark ? "text-slate-500" : "text-slate-500"}>
              © {new Date().getFullYear()} MedCare Health, Inc. All rights reserved.
            </span>

            <span
              className={`hidden sm:inline-block h-3.5 w-px ${
                isDark ? "bg-slate-800" : "bg-slate-300"
              }`}
            />

            
          </div>

          {/* Back to Top */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all border cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive feedback toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-medium shadow-2xl border border-slate-800 animate-in fade-in duration-200">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>{activeToast}</span>
        </div>
      )}
    </footer>
  );
}
