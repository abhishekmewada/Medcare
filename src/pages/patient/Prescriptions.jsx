import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Pill,
  RefreshCw,
  Search,
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  CheckCircle2,
   Sparkles,
  HeartPulse,
  Info,
} from "lucide-react";
import {
  fetchMyPrescriptions,
  requestRefill,
} from "../../redux/slice/prescriptionSlice";

const Prescriptions = () => {
  const dispatch = useDispatch();
  const {
    prescriptions = [],
    loading,
    loadingMore,
    error,
    hasMore,
    counts,
  } = useSelector((state) => state.prescriptions);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [refillNotification, setRefillNotification] = useState(null);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch page 1 when filter or debounced search changes
  useEffect(() => {
    setPage(1);
    dispatch(
      fetchMyPrescriptions({
        page: 1,
        limit: 10,
        filter: activeFilter,
        search: debouncedSearch,
      })
    );
  }, [dispatch, activeFilter, debouncedSearch]);

  // Load next batch on scroll
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(
      fetchMyPrescriptions({
        page: nextPage,
        limit: 10,
        filter: activeFilter,
        search: debouncedSearch,
      })
    ).finally(() => {
      isFetchingRef.current = false;
    });
  }, [dispatch, loading, loadingMore, hasMore, page, activeFilter, debouncedSearch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  const handleRefill = async (id, medName) => {
    const res = await dispatch(requestRefill(id));
    if (!res.error) {
      setRefillNotification(`Refill request successfully sent for ${medName}.`);
      setTimeout(() => setRefillNotification(null), 3500);
    }
  };

  // Helper to extract the list of medicines safely
  const getMedicinesList = (rx) => {
    if (Array.isArray(rx.medicines) && rx.medicines.length > 0) {
      return rx.medicines;
    }
    if (Array.isArray(rx.medications) && rx.medications.length > 0) {
      return rx.medications;
    }
    if (rx.medicationName) {
      return [
        {
          name: rx.medicationName,
          dosage: rx.dosage || "Standard Dose",
          frequency: rx.frequency || "As directed",
          duration: rx.duration || "",
        },
      ];
    }
    return [];
  };

  const filtered = useMemo(() => {
    return prescriptions.filter((rx) => {
      const meds = getMedicinesList(rx);
      const medNames = meds
        .map((m) => m.name || m.medicineName || "")
        .join(" ")
        .toLowerCase();

      const doctor = (
        rx.doctor?.user?.fullName ||
        rx.doctor?.fullName ||
        rx.prescribedBy ||
        ""
      ).toLowerCase();

      const diagnosis = (rx.diagnosis || "").toLowerCase();
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q ||
        medNames.includes(q) ||
        doctor.includes(q) ||
        diagnosis.includes(q);

      const isActive = rx.active !== false && rx.status !== "completed";
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "active"
          ? isActive
          : !isActive;

      return matchesSearch && matchesFilter;
    });
  }, [prescriptions, searchTerm, activeFilter]);

  // Tab counts
  const totalCount = prescriptions.length;
  const activeCount = prescriptions.filter(
    (rx) => rx.active !== false && rx.status !== "completed"
  ).length;
  const completedCount = prescriptions.filter(
    (rx) => rx.active === false || rx.status === "completed"
  ).length;

  const getTabCount = (tab) => {
    if (counts && counts[tab] !== undefined) return counts[tab];
    if (tab === "all") return totalCount;
    if (tab === "active") return activeCount;
    if (tab === "completed") return completedCount;
    return 0;
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8">
      
      {/* ── REFILL NOTIFICATION TOAST ── */}
      {refillNotification && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-full border border-[#8cd790]/50 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-md transition-all animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-[#285943]" />
          <span className="text-xs font-semibold text-slate-900">
            {refillNotification}
          </span>
        </div>
      )}

      {/* ── 1. EDITORIAL HERO HEADER (CareSync Style) ── */}
      <div   className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-stone-200/60 pb-6">
        <div data-aos="fade-right" className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
            <Pill className="h-3.5 w-3.5 text-[#77af9c]" />
            <span>Digital Dispensary</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{(counts?.active ?? activeCount)} Active Medications</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]">
            Manage your{" "}
            <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900 shadow-2xs">
              active
            </span>{" "}
            prescriptions &amp;{" "}
            <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
              refills.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Review verified dosage schedules, physician instructions, and request instant pharmacy refills with one click.
          </p>
        </div>

        {/* Security / HIPAA Verified Chip */}
        <div className="flex items-center gap-2 self-start lg:self-auto rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
          <span>E-Prescription Verified</span>
        </div>
      </div>

      {/* ── 2. CLINICAL ADHERENCE & SAFETY BENTO TILES ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Safety Tip 1: Timing & Adherence */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              safety • 01
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EBF7F2] text-[#285943] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Dosage Consistency</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Take medications at identical intervals daily to maintain therapeutic blood levels. Do not skip or double doses.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#285943]">
            <span>Tip: Set a recurring daily reminder</span>
          </div>
        </div>

        {/* Safety Tip 2: Timely Refills */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#77af9c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
              safety • 02
            </span>
            <div className="h-8 w-8 rounded-full bg-[#FFF1ED] text-[#FA6432] flex items-center justify-center">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Prompt 5-Day Refills</h4>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Submit your refill requests when you have 5 to 7 days of supply left to avoid pharmacy processing gaps.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#FA6432]">
            <span>Tip: Track your remaining count</span>
          </div>
        </div>

        {/* Safety Tip 3: Doctor Consultation */}
        <div className="rounded-[24px] border border-[#77af9c]/40 bg-[#E8F4F0]/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[#77af9c]/30 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#285943]">
              safety • 03
            </span>
            <div className="h-8 w-8 rounded-full bg-[#285943] text-white flex items-center justify-center">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Report Any Side Effects</h4>
            <p className="mt-1 text-xs text-[#285943]/80 leading-relaxed">
              If you observe unusual reactions or discomfort, message your prescribing physician or use the symptom checker.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#77af9c]/20 flex items-center gap-1.5 text-[11px] font-semibold text-[#285943]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>24/7 Clinical Triage Available</span>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER TABS & SEARCH PILL BAR ── */}
      <div className="rounded-[26px] border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        
        {/* Pill-shaped Tabs */}
        <div className="flex items-center gap-2">
          {["all", "active", "completed"].map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all duration-200 ${
                  isActive
                    ? "bg-[#285943] text-white shadow-xs"
                    : "bg-[#F7F8F5] text-stone-600 hover:bg-[#EBF7F2] hover:text-[#285943]"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-[#DDF4EC] text-[#285943]"
                      : "bg-white text-stone-600 border border-stone-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Minimal Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search medicine, doctor, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-[#F9FAF8] py-2 pl-9 pr-4 text-xs text-slate-800 outline-none transition-all placeholder:text-stone-400 focus:border-[#77af9c] focus:bg-white focus:ring-2 focus:ring-[#77af9c]/20"
          />
        </div>
      </div>

      {/* ── 4. PRESCRIPTIONS BENTO LIST ── */}
      {loading && prescriptions.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center py-20 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#285943] border-t-transparent" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#285943]">
            Loading prescription history...
          </p>
        </div>
      ) : error && prescriptions.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-stone-200 bg-white p-14 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF7F2] text-[#285943]">
            <Pill className="h-6 w-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Prescriptions Found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
            There are currently no active or historical medications matching this filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((item) => {
              const id = item._id || item.id;
              const doctorName =
                item.doctor?.user?.fullName ||
                item.doctor?.fullName ||
                item.prescribedBy ||
                "Attending Physician";

              const date = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : item.datePrescribed || "Recent";

              const meds = getMedicinesList(item);
              const primaryMedName = meds[0]?.name || meds[0]?.medicineName || "Prescription Item";
              const isActive = item.active !== false && item.status !== "completed";

              return (
                <div
                  key={id}
                  className="group relative flex flex-col justify-between rounded-[28px] border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#77af9c]/60"
                >
                  <div>
                    {/* TOP HEADER */}
                    <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DDF4EC] text-[#285943] shadow-xs">
                          <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-[#DDF4EC] text-[#285943] border border-[#8cd790]/60"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}>
                              {isActive ? "Active Rx" : "Completed"}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              Dr. {doctorName}
                            </span>
                          </div>
                          <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-[#285943] transition-colors">
                            {item.diagnosis || primaryMedName}
                          </h3>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-[#F9FAF8] px-3 py-1 text-[11px] font-medium text-stone-600">
                        <Clock className="h-3 w-3 text-[#77af9c]" />
                        <span>{date}</span>
                      </span>
                    </div>

                    {/* MEDICATIONS LIST */}
                    <div className="mt-4 space-y-2.5">
                      {meds.map((m, idx) => {
                        const medicineTitle = m.name || m.medicineName || "Unnamed Medicine";
                        return (
                          <div
                            key={idx}
                            className="rounded-2xl border border-stone-100 bg-[#FBFDFB] p-3.5 text-xs transition-colors hover:border-[#77af9c]/40"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="text-sm font-semibold text-slate-900">
                                {medicineTitle}
                              </span>
                              {m.dosage && (
                                <span className="rounded-full border border-[#77af9c]/30 bg-[#DDF4EC] px-2.5 py-0.5 text-[10px] font-bold text-[#285943]">
                                  {m.dosage}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
                              {m.frequency && (
                                <span>
                                  <strong className="text-stone-700">Frequency:</strong> {m.frequency}
                                </span>
                              )}
                              {m.duration && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span>
                                    <strong className="text-stone-700">Duration:</strong> {m.duration}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CLINICAL INSTRUCTIONS */}
                    {(item.instructions || item.notes) && (
                      <div className="mt-3.5 flex items-start gap-2 rounded-2xl border border-stone-100 bg-stone-50/70 p-3 text-[11px] text-stone-600">
                        <Info className="h-4 w-4 shrink-0 text-[#77af9c] mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-800">Doctor's Guidance: </span>
                          <span className="italic">{item.instructions || item.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER & REFILL BUTTON */}
                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3.5">
                    <div className="text-xs text-stone-500">
                      <span>Refills remaining: </span>
                      <strong className="font-bold text-slate-900 rounded-full bg-stone-100 px-2 py-0.5 text-[11px]">
                        {item.refillsRemaining ?? 0}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRefill(id, primaryMedName)}
                      disabled={!item.refillsRemaining || item.refillsRemaining <= 0}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FA6432] hover:bg-[#e45222] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Request Refill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

          {/* Loading more batch indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-6 text-stone-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#285943] border-t-transparent" />
              <span className="ml-3 text-xs font-semibold text-[#285943]">
                Loading more prescriptions...
              </span>
            </div>
          )}
        </>
      )}

      {/* ── 5. COMPLIANCE & VERIFICATION FOOTER ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/70 px-5 py-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#77af9c] shrink-0" />
          <span>Medications prescribed through this portal are digitally signed and verified by licensed practitioners.</span>
        </div>
        <span className="text-[11px] text-stone-400">MedCare E-Rx v2.4</span>
      </div>

    </div>
  );
};

export default Prescriptions;