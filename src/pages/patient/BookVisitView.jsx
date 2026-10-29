import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapPin,
  CalendarDays,
  Star,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAppointment } from "../../context/AppointmentContext";
import BookVisitModal from "../../components/patient/BookVisitModal";
import { fetchDoctors } from "../../redux/slice/doctorSlice";

const BookVisitView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const dispatch = useDispatch();
  const {
    doctors = [],
    loading,
    loadingMore,
    error,
    hasMore,
    total,
  } = useSelector((state) => state.doctors);

  const { selectDoctor } = useAppointment();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch page 1 when specialty or debounced search changes
  useEffect(() => {
    setPage(1);
    dispatch(
      fetchDoctors({
        page: 1,
        limit: 10,
        specialty: selectedSpecialty,
        search: debouncedSearch,
      })
    );
  }, [dispatch, selectedSpecialty, debouncedSearch]);

  // Load next batch on scroll
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(
      fetchDoctors({
        page: nextPage,
        limit: 10,
        specialty: selectedSpecialty,
        search: debouncedSearch,
      })
    ).finally(() => {
      isFetchingRef.current = false;
    });
  }, [dispatch, loading, loadingMore, hasMore, page, selectedSpecialty, debouncedSearch]);

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

  const uniqueSpecialties = Array.from(
    new Set(
      doctors
        .map((doc) => doc?.specialty?.trim())
        .filter(Boolean)
    )
  );

  const specialties = [
    "All",
    ...new Set([
      "Orthopedics",
      "Cardiology",
      "General Physician",
      "Dermatology",
      "Neurology",
      ...uniqueSpecialties,
    ]),
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const doctorName = doc?.fullName || doc?.name || "";
    const doctorSpecialty = doc?.specialty || "";

    const matchesSearch =
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "All" ||
      doctorSpecialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty && doc.isApproved && !doc.isBlocked;
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#285943] border-t-transparent" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#285943]">
          Loading certified specialists...
        </p>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
        <span>Failed to load doctors: {error}. Please refresh or try again later.</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8">
      
      {/* ── 1. EDITORIAL HERO HEADER (CareSync Style) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6  border-b border-stone-200/60 pb-6">
        <div data-aos="fade-right" className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
            <Stethoscope className="h-3.5 w-3.5 text-[#77af9c]" />
            <span>Certified Care Specialists</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{total ?? filteredDoctors.length} Doctors Available</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]">
            Find &amp;{" "}
            <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900 shadow-2xs">
              consult
            </span>{" "}
            with certified{" "}
            <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
              specialists.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Book certified in-clinic visits or telehealth video consultations tailored to your diagnostic and care needs.
          </p>
        </div>

        {/* Quality Guarantee Pill */}
        <div className="flex items-center gap-2 self-start lg:self-auto rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
          <span>100% Board Certified Practitioners</span>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH PILL BAR ── */}
      <div className="rounded-[26px] border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        
        {/* Specialty Pill Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {specialties.map((specialty) => {
            const isSelected = selectedSpecialty === specialty;
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => setSelectedSpecialty(specialty)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-[#285943] text-white shadow-xs"
                    : "bg-[#F7F8F5] text-stone-600 hover:bg-[#EBF7F2] hover:text-[#285943]"
                }`}
              >
                {specialty}
              </button>
            );
          })}
        </div>

        {/* Minimalist Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search physician or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-[#F9FAF8] py-2 pl-9 pr-4 text-xs text-slate-800 outline-none transition-all placeholder:text-stone-400 focus:border-[#77af9c] focus:bg-white focus:ring-2 focus:ring-[#77af9c]/20"
          />
        </div>
      </div>

      {/* ── 3. DOCTORS BENTO GRID ── */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-stone-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF7F2] text-[#285943]">
            <Search className="h-6 w-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No doctors found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
            No specialists match your criteria. Try picking another medical specialty or clearing your search term.
          </p>
          {(searchTerm || selectedSpecialty !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("All");
              }}
              className="mt-4 inline-flex items-center rounded-full border border-stone-200 bg-white px-5 py-2 text-xs font-semibold text-[#285943] shadow-2xs hover:bg-stone-50 transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id || doc._id}
                doc={doc}
                onSchedule={() => selectDoctor(doc)}
              />
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

          {/* Loading more batch indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-6 text-stone-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#285943] border-t-transparent" />
              <span className="ml-3 text-xs font-semibold text-[#285943]">
                Loading more specialists...
              </span>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      <BookVisitModal />
    </div>
  );
};

// ============================================================
// AVATAR URL RESOLVER
// ============================================================

const resolveAvatarUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
};

// ============================================================
// DOCTOR BENTO CARD
// ============================================================

const DoctorCard = ({ doc, onSchedule }) => {
  const [imgError, setImgError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const initials =
    doc.avatarLetter ||
    doc.fullName?.replace("Dr. ", "")?.charAt(0)?.toUpperCase() ||
    "D";

  const image = doc?.avatar;
  const avatarUrl = resolveAvatarUrl(image);
  const hasImage = avatarUrl && !imgError;

  const locationText = doc.clinicAddress || doc.address || doc.city || "";
  const clinicText = doc.clinicName || "";
  const displayLocation =
    [locationText, clinicText].filter(Boolean).join(" • ") ||
    "Location not specified";

  const hasRating =
    doc.rating !== undefined && doc.rating !== null && Number(doc.rating) > 0;
  const ratingDisplay = hasRating ? Number(doc.rating).toFixed(1) : "New";

  const feeDisplay =
    doc.fees !== undefined && doc.fees !== null && doc.fees !== ""
      ? `₹${doc.fees} / Visit`
      : "Fee not specified";

  const experienceDisplay =
    doc.experience !== undefined && doc.experience !== null && doc.experience !== ""
      ? `${doc.experience} ${Number(doc.experience) === 1 ? "Year" : "Years"}`
      : "Not specified";

  const reviewText =
    doc.totalReviews > 0
      ? `• ${doc.totalReviews} ${doc.totalReviews === 1 ? "Review" : "Reviews"}`
      : "• Verified Practitioner";

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-stone-200/80 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#77af9c]/60 flex flex-col justify-between"
      >
        <div>
          {/* IMAGE CONTAINER WITH CARE TAGS */}
          <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-stone-100">
            {hasImage ? (
              <img
                src={avatarUrl}
                alt={doc?.fullName || "Doctor"}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover object-[center_25%] transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#DDF4EC] text-[#285943]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 font-bold text-2xl text-[#285943] shadow-xs">
                  {initials}
                </div>
              </div>
            )}

            {/* Verified Badge */}
            <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
              <CheckCircle2 size={11} className="text-[#77af9c] shrink-0" />
              <span>Verified</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-2xs backdrop-blur-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{ratingDisplay}</span>
            </div>

            {/* Bottom Fee Pill */}
            <div className="absolute bottom-2.5 left-2.5 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
              {feeDisplay}
            </div>
          </div>

          {/* DOCTOR INFO */}
          <div className="pt-3.5 space-y-1">
            <span className="inline-block rounded-full border border-[#77af9c]/30 bg-[#E8F4F0] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#285943]">
              {doc.specialty || "Specialist"}
            </span>

            <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-[#285943] transition-colors">
              {doc.fullName || doc.name || "Doctor"}
            </h3>

            <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
              <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
              <span>{displayLocation}</span>
            </p>
          </div>
        </div>

        {/* ACTIONS FOOTER */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSchedule();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#285943] py-2.5 text-xs font-semibold text-white shadow-2xs transition-all duration-200 hover:bg-[#1e4533] active:scale-[0.98]"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Book Visit</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            title="View Details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 group-hover:border-[#FA6432] group-hover:bg-[#FA6432] group-hover:text-white transition-all shadow-2xs"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ================= EDITORIAL DETAILS POPUP ================= */}
      {showDetails && (
        <div
          onClick={() => setShowDetails(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-4xl border border-stone-200/80 bg-[#FAFBF9] p-6 sm:p-7 shadow-2xl space-y-5 overflow-hidden"
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-2xs"
            >
              <X size={16} />
            </button>

            {/* DOCTOR PROFILE HEADER */}
            <div className="flex items-center gap-4 pr-6">
              <div className="h-16 w-16 shrink-0 relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                {hasImage ? (
                  <img
                    src={avatarUrl}
                    alt={doc.fullName || "Doctor"}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#DDF4EC] text-xl font-bold text-[#285943]">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#77af9c]/30 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#285943]">
                  <CheckCircle2 size={11} className="text-[#77af9c]" />
                  <span>Verified Practitioner</span>
                </span>

                <h3 className="truncate text-lg font-bold text-slate-900 mt-1">
                  {doc.fullName || doc.name || "Doctor"}
                </h3>

                <p className="text-xs font-semibold text-[#77af9c]">
                  {doc.specialty || "Specialist"}
                </p>

                <div className="mt-1 flex items-center gap-1 text-xs text-stone-600">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{ratingDisplay}</span>
                  <span className="text-stone-400">{reviewText}</span>
                </div>
              </div>
            </div>

            {/* EXPERIENCE & QUALIFICATION */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Experience
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-800">
                  {experienceDisplay}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Qualification
                </p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
                  {doc.qualification || "Not specified"}
                </p>
              </div>
            </div>

            {/* ABOUT */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Physician Overview
              </p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-stone-600">
                {doc.about || "No professional overview provided."}
              </p>
            </div>

            {/* LOCATION + FEES */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs">
                <MapPin className="h-4 w-4 shrink-0 text-[#77af9c]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Location
                  </p>
                  <p className="truncate text-xs font-bold text-slate-800">
                    {doc.clinicAddress || doc.address || doc.city || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#DDF4EC] text-xs font-bold text-[#285943]">
                  ₹
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Consultation
                  </p>
                  <p className="truncate text-xs font-bold text-slate-800">
                    {doc.fees !== undefined && doc.fees !== null && doc.fees !== ""
                      ? `₹${doc.fees}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* AVAILABLE DAYS CHIPS */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Clinic Schedule
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doc.availableDays?.length ? (
                  doc.availableDays.slice(0, 5).map((day) => (
                    <span
                      key={day}
                      className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-medium text-slate-700"
                    >
                      {day}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">Available on schedule</span>
                )}
                {doc.availableDays?.length > 5 && (
                  <span className="rounded-full bg-[#DDF4EC] px-2 py-0.5 text-[10px] font-bold text-[#285943]">
                    +{doc.availableDays.length - 5}
                  </span>
                )}
              </div>
            </div>

            {/* ACTION CTA BUTTON */}
            <button
              type="button"
              onClick={() => {
                setShowDetails(false);
                onSchedule();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FA6432] hover:bg-[#e45222] py-3 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Proceed to Booking</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookVisitView;