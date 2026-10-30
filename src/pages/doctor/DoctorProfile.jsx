import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  BriefcaseMedical,
  Droplets,
  VenusAndMars,
  Pencil,
  X,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Building2,
  IndianRupee,
  Languages,
  Video,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";
import { getImageUrl } from "../../utiles/imageURL";

import {
  updateDoctorProfileApi,
  getDoctorProfileApi,
} from "../../api/doctor.api";

// ==========================================
// IMAGE URL RESOLVER
// ==========================================

// Use shared image URL resolver
import { getImageUrl } from "../../utiles/imageURL";
const resolveAvatarUrl = getImageUrl; // alias for backward compatibility

// ==========================================
// DEFAULT FORM STATE
// ==========================================

const initialFormState = {
  // Personal
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  address: "",
  avatar: "",

  // Professional
  specialty: "",
  qualification: "",
  experience: "",
  licenseNumber: "",
  registrationNumber: "",
  licenseAuthority: "",
  licenseExpiryDate: "",

  // Consultation
  fees: "",
  consultationType: [],
  languages: [],
  isAvailable: true,

  // Clinic
  clinicName: "",
  clinicAddress: "",

  // Other
  about: "",

  // Insurance
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceExpiryDate: "",
};

// Pure transformation helper from server profile to form state
const buildFormData = (profileData) => {
  if (!profileData) return initialFormState;

  const u = profileData.user || {};
  const d = profileData.doctor || {};

  const specialty =
    typeof d.specialty === "object"
      ? d.specialty?.name || ""
      : d.specialty || "";

  return {
    fullName: u.fullName || "",
    email: u.email || "",
    phone: u.phone || "",
    dob: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
    gender: u.gender || "",
    bloodGroup: u.bloodGroup || "",
    address: u.address || "",
    avatar: u.avatar || "",

    specialty,
    qualification: d.qualification || "",
    experience: d.experience ?? "",
    licenseNumber: d.licenseNumber || "",
    registrationNumber: d.registrationNumber || "",
    licenseAuthority: d.licenseAuthority || "",
    licenseExpiryDate: d.licenseExpiryDate
      ? d.licenseExpiryDate.slice(0, 10)
      : "",

    fees: d.fees ?? "",
    consultationType: d.consultationType || [],
    languages: d.languages || [],
    isAvailable: d.isAvailable ?? true,

    clinicName: d.clinicName || "",
    clinicAddress: d.clinicAddress || "",
    about: d.about || "",

    insuranceProvider: d.insurance?.provider || "",
    insurancePolicyNumber: d.insurance?.policyNumber || "",
    insuranceExpiryDate: d.insurance?.expiryDate
      ? d.insurance.expiryDate.slice(0, 10)
      : "",
  };
};

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);

  // Modal & File Upload State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getDoctorProfileApi();

        if (response?.success && response?.profile) {
          setProfile(response.profile);
          const populatedForm = buildFormData(response.profile);
          setForm(populatedForm);
          setPreview(populatedForm.avatar);
        }
      } catch (err) {
        console.error("GET DOCTOR PROFILE ERROR:", err);
        setError(
          err.response?.data?.message || "Failed to load clinical profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Cleanup object URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setSaved(false);
    setError("");
  };

  const openEditModal = () => {
    setError("");
    setSaved(false);
    setSelectedFile(null);
    setPreview(form.avatar || profile?.user?.avatar || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) return;
    setShowEditModal(false);
    setSelectedFile(null);
    setPreview(form.avatar || profile?.user?.avatar || "");
    setError("");
  };

  // ==========================================
  // IMAGE SELECTION & INSTANT PREVIEW
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setSaved(false);
  };

  const toggleConsultationType = (type) => {
    setForm((prev) => {
      const selected = prev.consultationType.includes(type);
      return {
        ...prev,
        consultationType: selected
          ? prev.consultationType.filter((item) => item !== type)
          : [...prev.consultationType, type],
      };
    });
    setSaved(false);
    setError("");
  };

  // ==========================================
  // FORM SUBMISSION (Preserves exact logic)
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const formData = new FormData();

      // Personal
      if (form.fullName) formData.append("fullName", form.fullName);
      if (form.phone) formData.append("phone", form.phone);
      if (form.dob) formData.append("dateOfBirth", form.dob);
      if (form.gender) formData.append("gender", form.gender);
      if (form.bloodGroup) formData.append("bloodGroup", form.bloodGroup);
      if (form.address) formData.append("address", form.address);

      // Professional
      if (form.specialty) formData.append("specialty", form.specialty);
      if (form.qualification) formData.append("qualification", form.qualification);
      if (form.experience !== "") formData.append("experience", form.experience);
      if (form.licenseNumber) formData.append("licenseNumber", form.licenseNumber);
      if (form.registrationNumber)
        formData.append("registrationNumber", form.registrationNumber);
      if (form.licenseAuthority)
        formData.append("licenseAuthority", form.licenseAuthority);
      if (form.licenseExpiryDate)
        formData.append("licenseExpiryDate", form.licenseExpiryDate);

      // Consultation
      if (form.fees !== "") formData.append("fees", form.fees);
      formData.append(
        "consultationType",
        JSON.stringify(form.consultationType)
      );
      formData.append("languages", JSON.stringify(form.languages));
      formData.append("isAvailable", String(form.isAvailable));

      // Clinic
      formData.append("clinicName", form.clinicName || "");
      formData.append("clinicAddress", form.clinicAddress || "");

      // About
      formData.append("about", form.about || "");

      // Insurance
      formData.append("insuranceProvider", form.insuranceProvider || "");
      formData.append(
        "insurancePolicyNumber",
        form.insurancePolicyNumber || ""
      );
      formData.append(
        "insuranceExpiryDate",
        form.insuranceExpiryDate || ""
      );

      // Selected Avatar File
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await updateDoctorProfileApi(formData);

      if (response?.success && response?.profile) {
        setProfile(response.profile);
        const updated = buildFormData(response.profile);
        setForm(updated);
        setPreview(updated.avatar);
        setSelectedFile(null);
        setSaved(true);

        setTimeout(() => {
          setShowEditModal(false);
        }, 700);
      }
    } catch (err) {
      console.error("UPDATE DOCTOR PROFILE ERROR:", err);
      setError(
        err.response?.data?.message || "Failed to update profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  // Initials Fallback
  const initials =
    form.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#0F766E]" />
          <p className="text-xs font-semibold text-slate-400">
            Loading practitioner profile...
          </p>
        </div>
      </div>
    );
  }

  const activeAvatar = resolveAvatarUrl(form.avatar);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] antialiased dark:bg-[#0B1116] dark:text-slate-100 pt-28 md:pt-32 pb-24 selection:bg-teal-500/20">
      <div className="mx-auto w-full max-w-[1920px] space-y-8 px-4 sm:px-8 md:px-14 lg:px-20">
        {/* ==================================================== */}
       {/* ==================================================== */}
        {/* 1. PAGE HEADER                                       */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/70 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
              </span>
              <span className="tracking-wide">Practitioner Profile</span>
              <span className="text-teal-300 dark:text-teal-700">•</span>
              <span className="text-slate-600 dark:text-slate-400">Clinical Credentials</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Doctor Profile &amp; Practice
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Personal clinician bio, schedule policies, consultation tariffs, and clinic affiliation.
            </p>
          </div>

          <button
            type="button"
            onClick={openEditModal}
            className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-700/20 transition-all hover:bg-teal-800 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Pencil size={14} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* 2. ELEVATED PRACTITIONER HERO PROFILE                */}
        {/* ==================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 lg:p-10 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          
          {/* Ambient soft background glow */}
          <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            
            {/* ── BIG HERO PORTRAIT FRAME ── */}
            <div className="relative shrink-0 w-full max-w-70 sm:max-w-[320px] lg:w-72 xl:w-80">
              
              {/* Layered Decorative Frame & Depth Ring */}
              <div className="relative aspect-3/4 w-full rounded-3xl overflow-hidden   bg-linear-to-br from-teal-800 via-teal-700 to-emerald-900 shadow-xl shadow-teal-900/10 dark:border-slate-800">
                {activeAvatar ? (
                  <img
                    src={activeAvatar}
                    alt={form.fullName || "Doctor"}
                    className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white">
                    <span className="text-6xl font-light tracking-wider opacity-90">{initials}</span>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-teal-200/80">Clinician</span>
                  </div>
                )}

                {/* Subtle soft gradient fade at base of image */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                {/* Status indicator pinned inside the frame bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-white/60 shadow-md dark:bg-slate-900/90 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        {form.isAvailable && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${form.isAvailable ? "bg-emerald-600" : "bg-slate-400"}`} />
                      </span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {form.isAvailable ? "Available Now" : "Duty Off"}
                      </span>
                    </div>

                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                      form.isAvailable 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300" 
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {form.isAvailable ? "Live" : "Away"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PRACTITIONER CLINICAL BIO & HIGHLIGHTS ── */}
            <div className="flex-1 flex flex-col justify-between w-full space-y-6 text-center sm:text-left">
              
              {/* Doctor Name & Credentials */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                    <ShieldCheck size={14} className="text-teal-600" />
                    Verified Practitioner
                  </span>

                  {form.experience !== "" && (
                    <span className="rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                      {form.experience}+ Years Practice
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">
                  {form.fullName ? `Dr. ${form.fullName}` : "Doctor"}
                </h2>

                <p className="text-sm sm:text-base font-semibold text-teal-700 dark:text-teal-400">
                  {form.specialty || "Medical Specialist"}
                  {form.qualification && (
                    <span className="text-slate-600 dark:text-slate-400 font-normal"> • {form.qualification}</span>
                  )}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {form.clinicName ? (
                    <>Senior Consultant affiliated with <strong className="font-semibold text-slate-800 dark:text-slate-200">{form.clinicName}</strong>.</>
                  ) : (
                    "Registered medical practitioner offering specialist patient triage and consultations."
                  )}
                </p>
              </div>

              {/* Clinical Metrics Bento Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-teal-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-teal-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Consultation Fee
                  </span>
                  <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {form.fees !== "" ? `₹${form.fees}` : "—"}
                  </p>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Per Session</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-teal-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-teal-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Medical License
                  </span>
                  <p className="mt-1 text-sm sm:text-base font-bold text-teal-800 dark:text-teal-300 truncate">
                    {form.licenseNumber || "Pending"}
                  </p>
                  <span className="text-[10px] text-slate-500">Board Authorized</span>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-teal-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-teal-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duty Schedule
                  </span>
                  <p className="mt-1 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    {form.isAvailable ? "Accepting Patients" : "Off Duty"}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Regular OP Hours</span>
                </div>
              </div>

              {/* Direct Practice Contacts Strip */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {form.email && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Mail size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-medium truncate max-w-50">{form.email}</span>
                  </div>
                )}

                {form.phone && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Phone size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-medium">{form.phone}</span>
                  </div>
                )}

                {form.clinicAddress && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <MapPin size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-medium truncate max-w-60">{form.clinicAddress}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. STRUCTURED CLINICAL PROFILE SECTIONS              */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Section 1: Professional & Credentials */}
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <GraduationCap size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Medical Credentials &amp; Registration
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Regulatory license and academic qualifications
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <DisplayField
                label="Specialization"
                value={form.specialty}
                icon={BriefcaseMedical}
              />
              <DisplayField
                label="Highest Qualification"
                value={form.qualification}
                icon={GraduationCap}
              />
              <DisplayField
                label="Clinical Experience"
                value={form.experience !== "" ? `${form.experience} Years` : ""}
                icon={Activity}
              />
              <DisplayField
                label="Medical License No."
                value={form.licenseNumber}
                icon={FileText}
              />
              <DisplayField
                label="Registration No."
                value={form.registrationNumber}
                icon={ShieldCheck}
              />
              <DisplayField
                label="Licensing Council"
                value={form.licenseAuthority}
                icon={FileText}
              />
              <div className="col-span-2">
                <DisplayField
                  label="License Valid Until"
                  value={form.licenseExpiryDate}
                  icon={CalendarDays}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Consultation & Practice Settings */}
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <IndianRupee size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Consultation Parameters
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Fees, appointment channels, and language proficiency
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <DisplayField
                label="Consultation Fee"
                value={form.fees !== "" ? `₹${form.fees}` : ""}
                icon={IndianRupee}
              />
              <DisplayField
                label="Duty Availability"
                value={form.isAvailable ? "Available" : "Not Available"}
                icon={CheckCircle2}
              />
              <div className="col-span-2">
                <DisplayField
                  label="Consultation Channels"
                  value={
                    form.consultationType?.length
                      ? form.consultationType
                          .map((item) =>
                            item === "in-person"
                              ? "In-Person Clinic"
                              : "Video Telehealth"
                          )
                          .join(", ")
                      : ""
                  }
                  icon={Video}
                />
              </div>
              <div className="col-span-2">
                <DisplayField
                  label="Languages Spoken"
                  value={form.languages?.join(", ")}
                  icon={Languages}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Clinic & Location */}
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Clinic &amp; Workplace Information
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Affiliated clinic or primary hospital location
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <DisplayField
                label="Clinic / Facility Name"
                value={form.clinicName}
                icon={Building2}
              />
              <DisplayField
                label="Complete Clinic Address"
                value={form.clinicAddress}
                icon={MapPin}
              />
            </div>
          </section>

          {/* Section 4: Personal Information */}
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Personal &amp; Contact Information
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Private identity and verified communication channels
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <DisplayField
                label="Full Legal Name"
                value={form.fullName}
                icon={User}
              />
              <DisplayField
                label="Email Address"
                value={form.email}
                icon={Mail}
              />
              <DisplayField
                label="Phone Number"
                value={form.phone}
                icon={Phone}
              />
              <DisplayField
                label="Date of Birth"
                value={form.dob}
                icon={CalendarDays}
              />
              <DisplayField
                label="Gender"
                value={form.gender}
                icon={VenusAndMars}
              />
              <DisplayField
                label="Blood Group"
                value={form.bloodGroup}
                icon={Droplets}
              />
              <div className="col-span-2">
                <DisplayField
                  label="Residential Address"
                  value={form.address}
                  icon={MapPin}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Section 5: Clinical Bio & Professional Statement */}
        {form.about && (
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Clinical Bio &amp; Professional Statement
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Practitioner introduction and clinical philosophy
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#334155] dark:text-slate-300 whitespace-pre-line">
              {form.about}
            </p>
          </section>
        )}

        {/* Section 6: Professional Liability Insurance */}
        {(form.insuranceProvider ||
          form.insurancePolicyNumber ||
          form.insuranceExpiryDate) && (
          <section className="rounded-[20px] border border-slate-200/80 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E] dark:bg-teal-950/60 dark:text-teal-300">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Professional Liability Insurance
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Medical indemnity and malpractice policy coverage
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <DisplayField
                label="Insurance Provider"
                value={form.insuranceProvider}
                icon={FileText}
              />
              <DisplayField
                label="Policy Number"
                value={form.insurancePolicyNumber}
                icon={FileText}
              />
              <DisplayField
                label="Coverage Expiry"
                value={form.insuranceExpiryDate}
                icon={CalendarDays}
              />
            </div>
          </section>
        )}
      </div>

      {/* ==================================================== */}
      {/* 4. EDIT PROFILE MODAL (FIXED IMAGE PREVIEW)          */}
      {/* ==================================================== */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <span>Edit Practitioner Profile</span>
                  <span className="rounded-full bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                    Medical Registry
                  </span>
                </h2>
                <p className="text-xs text-[#64748B]">
                  Update your credentials, photo, and consultation details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Tab Navigation in Modal */}
              <div className="flex border-b border-slate-100 px-6 bg-[#F8FAFC]/50 dark:border-slate-800 dark:bg-slate-800/40 gap-2">
                {[
                  { id: "personal", label: "Identity & Photo" },
                  { id: "credentials", label: "Credentials & Clinic" },
                  { id: "consultation", label: "Practice & Bio" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-3 text-xs font-bold transition-all border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "border-[#0F766E] text-[#0F766E] dark:border-teal-400 dark:text-teal-300"
                        : "border-transparent text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* Error Banner */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* TAB 1: IDENTITY & AVATAR */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    {/* AVATAR UPLOAD SECTION (Fixed Preview Bug) */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="relative">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 ring-4 ring-teal-500/15 dark:bg-teal-950/40 dark:ring-teal-500/20">
                          {preview ? (
                            <img
                              src={resolveAvatarUrl(preview)}
                              alt="Doctor Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-2xl font-black text-[#0F766E]">
                              {initials}
                            </span>
                          )}
                        </div>

                        <label
                          htmlFor="doctor-avatar-input"
                          className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#0F766E] text-white shadow-md transition hover:bg-[#115E59] active:scale-95"
                          title="Upload new image"
                        >
                          <Camera size={14} />
                          <input
                            id="doctor-avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                          Profile Photography
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Upload a professional headshot. Format: JPG, PNG, WEBP up to 5MB.
                        </p>
                        {selectedFile && (
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Sparkles size={11} />
                            <span>New file selected: {selectedFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputBlock label="Full Legal Name" icon={User}>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={handleChange("fullName")}
                          placeholder="Dr. John Doe"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Email Address" icon={Mail}>
                        <input
                          type="email"
                          value={form.email}
                          disabled
                          className="profile-input cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800"
                        />
                      </InputBlock>

                      <InputBlock label="Phone Number" icon={Phone}>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={handleChange("phone")}
                          placeholder="+91 9876543210"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Date of Birth" icon={CalendarDays}>
                        <input
                          type="date"
                          value={form.dob}
                          onChange={handleChange("dob")}
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Gender" icon={VenusAndMars}>
                        <select
                          value={form.gender}
                          onChange={handleChange("gender")}
                          className="profile-input"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </InputBlock>

                      <InputBlock label="Blood Group" icon={Droplets}>
                        <input
                          type="text"
                          value={form.bloodGroup}
                          onChange={handleChange("bloodGroup")}
                          placeholder="e.g. O+"
                          className="profile-input"
                        />
                      </InputBlock>

                      <div className="sm:col-span-2">
                        <InputBlock label="Residential Address" icon={MapPin}>
                          <input
                            type="text"
                            value={form.address}
                            onChange={handleChange("address")}
                            placeholder="Enter clinic or home address"
                            className="profile-input"
                          />
                        </InputBlock>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CREDENTIALS & CLINIC */}
                {activeTab === "credentials" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputBlock label="Specialization" icon={BriefcaseMedical}>
                        <input
                          type="text"
                          value={form.specialty}
                          onChange={handleChange("specialty")}
                          placeholder="e.g. Cardiologist"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Qualifications" icon={GraduationCap}>
                        <input
                          type="text"
                          value={form.qualification}
                          onChange={handleChange("qualification")}
                          placeholder="e.g. MBBS, MD (Cardiology)"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Years of Experience" icon={Activity}>
                        <input
                          type="number"
                          min="0"
                          value={form.experience}
                          onChange={handleChange("experience")}
                          placeholder="e.g. 10"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Medical License Number" icon={FileText}>
                        <input
                          type="text"
                          value={form.licenseNumber}
                          onChange={handleChange("licenseNumber")}
                          placeholder="e.g. MCI-12345"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Registration Number" icon={ShieldCheck}>
                        <input
                          type="text"
                          value={form.registrationNumber}
                          onChange={handleChange("registrationNumber")}
                          placeholder="Registration number"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Licensing Council Authority" icon={FileText}>
                        <input
                          type="text"
                          value={form.licenseAuthority}
                          onChange={handleChange("licenseAuthority")}
                          placeholder="e.g. Delhi Medical Council"
                          className="profile-input"
                        />
                      </InputBlock>

                      <div className="sm:col-span-2">
                        <InputBlock label="License Expiry Date" icon={CalendarDays}>
                          <input
                            type="date"
                            value={form.licenseExpiryDate}
                            onChange={handleChange("licenseExpiryDate")}
                            className="profile-input"
                          />
                        </InputBlock>
                      </div>

                      <div className="sm:col-span-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <InputBlock label="Clinic or Hospital Affiliation" icon={Building2}>
                          <input
                            type="text"
                            value={form.clinicName}
                            onChange={handleChange("clinicName")}
                            placeholder="e.g. Apollo Speciality Clinic"
                            className="profile-input"
                          />
                        </InputBlock>
                      </div>

                      <div className="sm:col-span-2">
                        <InputBlock label="Clinic Address" icon={MapPin}>
                          <textarea
                            rows={3}
                            value={form.clinicAddress}
                            onChange={handleChange("clinicAddress")}
                            placeholder="Complete street address, city, state, pincode"
                            className="profile-input resize-none"
                          />
                        </InputBlock>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CONSULTATION & BIO */}
                {activeTab === "consultation" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputBlock label="Consultation Fee (INR)" icon={IndianRupee}>
                        <input
                          type="number"
                          min="0"
                          value={form.fees}
                          onChange={handleChange("fees")}
                          placeholder="e.g. 500"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Availability Status" icon={CheckCircle2}>
                        <select
                          value={String(form.isAvailable)}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              isAvailable: e.target.value === "true",
                            }))
                          }
                          className="profile-input"
                        >
                          <option value="true">Available for Consultations</option>
                          <option value="false">Duty Off / Unavailable</option>
                        </select>
                      </InputBlock>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Consultation Channels
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {[
                            { value: "in-person", label: "In-Person Clinic" },
                            { value: "video", label: "Video Consultation" },
                          ].map((channel) => {
                            const isSelected =
                              form.consultationType.includes(channel.value);
                            return (
                              <button
                                key={channel.value}
                                type="button"
                                onClick={() =>
                                  toggleConsultationType(channel.value)
                                }
                                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                  isSelected
                                    ? "border-[#0F766E] bg-teal-50 text-[#0F766E] dark:bg-teal-950/40 dark:text-teal-300"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                }`}
                              >
                                {channel.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <InputBlock label="Spoken Languages" icon={Languages}>
                          <input
                            type="text"
                            value={form.languages.join(", ")}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                languages: e.target.value
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean),
                              }))
                            }
                            placeholder="e.g. English, Hindi, Punjabi"
                            className="profile-input"
                          />
                        </InputBlock>
                      </div>

                      <div className="sm:col-span-2">
                        <InputBlock label="Professional Biography & Statement" icon={FileText}>
                          <textarea
                            rows={4}
                            maxLength={2000}
                            value={form.about}
                            onChange={handleChange("about")}
                            placeholder="Describe your medical approach, specialties, education and patient care philosophy..."
                            className="profile-input resize-none"
                          />
                          <p className="mt-1 text-right text-[10px] text-slate-400">
                            {form.about.length} / 2000 characters
                          </p>
                        </InputBlock>
                      </div>

                      <div className="sm:col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                          Professional Indemnity Insurance (Optional)
                        </p>
                      </div>

                      <InputBlock label="Insurance Provider" icon={FileText}>
                        <input
                          type="text"
                          value={form.insuranceProvider}
                          onChange={handleChange("insuranceProvider")}
                          placeholder="e.g. New India Assurance"
                          className="profile-input"
                        />
                      </InputBlock>

                      <InputBlock label="Policy Number" icon={FileText}>
                        <input
                          type="text"
                          value={form.insurancePolicyNumber}
                          onChange={handleChange("insurancePolicyNumber")}
                          placeholder="Policy certificate number"
                          className="profile-input"
                        />
                      </InputBlock>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8FAFC] px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[11px] text-slate-400">
                  {saved ? "Changes saved successfully!" : "Ensure all details are accurate."}
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#115E59] active:scale-95 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PRESENTATIONAL DISPLAY FIELD COMPONENT
// ==========================================

const DisplayField = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3 dark:border-slate-800/80 dark:bg-slate-800/50">
    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
      {Icon && <Icon size={12} className="text-[#0F766E] dark:text-teal-400" />}
      {label}
    </span>
    <p className="mt-1 text-xs font-bold text-[#0F172A] dark:text-slate-200 truncate">
      {value || <span className="font-normal text-slate-400">Not recorded</span>}
    </p>
  </div>
);

// ==========================================
// FORM INPUT BLOCK COMPONENT
// ==========================================

const InputBlock = ({ label, icon: Icon, children }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
      {Icon && <Icon size={13} className="text-slate-400" />}
      <span>{label}</span>
    </label>
    {children}
  </div>
);

export default DoctorProfile;