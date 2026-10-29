import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  AlertTriangle,
  Edit3,
  Save,
  X,
  Camera,
  Droplets,
  Ruler,
  Weight,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateUserProfile,
} from "../../redux/slice/userSlice";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("blob:")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

const getFormDataFromProfile = (profile) => ({
  fullName: profile?.fullName || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  dateOfBirth: profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
    : "",
  gender: profile?.gender || "",
  avatar: profile?.avatar || "",
  bloodType: profile?.bloodType || "",
  height: profile?.height || "",
  weight: profile?.weight || "",
  allergies: Array.isArray(profile?.allergies)
    ? profile.allergies
    : [],
  emergencyContact: {
    name: profile?.emergencyContact?.name || "",
    relationship: profile?.emergencyContact?.relationship || "",
    phone: profile?.emergencyContact?.phone || "",
  },
});

const Profile = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { profile, loading, error } = useSelector(
    (state) => state.user
  );

  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Actual selected image file
  const [avatarFile, setAvatarFile] = useState(null);

  // Image shown in preview
  const [avatarPreview, setAvatarPreview] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    avatar: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // ==========================================
  // SET PROFILE DATA INTO FORM
  // ==========================================

  useEffect(() => {
    if (!profile) return;

    const newFormData = getFormDataFromProfile(profile);
    setFormData(newFormData);
    setAvatarPreview(getImageUrl(profile.avatar));
    setAvatarFile(null);
  }, [profile]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // EMERGENCY CONTACT CHANGE
  // ==========================================

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value,
      },
    }));
  };

  // ==========================================
  // ALLERGIES CHANGE
  // ==========================================

  const handleAllergiesChange = (e) => {
    const allergies = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      allergies,
    }));
  };

  // ==========================================
  // AVATAR CHANGE
  // ==========================================

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB.");
      return;
    }

    setAvatarFile(file);

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // ==========================================
  // CLEANUP AVATAR PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancel = () => {
    if (!profile) return;
    setAvatarFile(null);
    setFormData(getFormDataFromProfile(profile));
    setAvatarPreview(getImageUrl(profile.avatar));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsEditing(false);
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("dateOfBirth", formData.dateOfBirth);
    data.append("gender", formData.gender);
    data.append("bloodType", formData.bloodType);
    data.append("height", formData.height);
    data.append("weight", formData.weight);

    data.append("allergies", JSON.stringify(formData.allergies));
    data.append("emergencyContact", JSON.stringify(formData.emergencyContact));

    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    const result = await dispatch(updateUserProfile(data));

    if (updateUserProfile.fulfilled.match(result)) {
      setIsEditing(false);
      setAvatarFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSavedMessage(true);
      setTimeout(() => {
        setSavedMessage(false);
      }, 2500);
    }
  };

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  if (loading && !profile) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-20 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#285943] border-t-transparent" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#285943]">
          Loading patient profile...
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
        <span>Failed to load profile: {error}. Please refresh or try again later.</span>
      </div>
    );
  }

  if (!profile) return null;

  const initials =
    (profile.fullName || "Patient")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PT";

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-slate-800 p-3 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* ── SUCCESS TOAST ── */}
      {savedMessage && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-full border border-[#8cd790]/50 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-md transition-all animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-[#285943]" />
          <span className="text-xs font-semibold text-slate-900">
            Profile changes saved successfully.
          </span>
        </div>
      )}

      {/* ── 1. EDITORIAL HERO HEADER (CareSync Style) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-stone-200/60 pb-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#77af9c]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#285943] shadow-2xs backdrop-blur-xs">
            <User className="h-3.5 w-3.5 text-[#77af9c]" />
            <span>Personal Health Dossier</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Verified Patient Identity</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.15]">
            Manage your{" "}
            <span className="inline-block rounded-full border border-slate-900/30 bg-white px-4 py-0.5 font-normal italic text-slate-900 shadow-2xs">
              clinical
            </span>{" "}
            profile &amp;{" "}
            <span className="inline-block rounded-full border border-[#77af9c]/50 bg-[#DDF4EC] px-4 py-0.5 font-medium text-[#285943]">
              vitals.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Keep your vital records, emergency contacts, and known allergies updated for precision care and medication safety.
          </p>
        </div>

        {/* Action Button */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FA6432] hover:bg-[#e45222] px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 self-start lg:self-auto"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── 2. ADVICE & PRIVACY BENTO TILES ── */}
       

      {/* ── 3. EDIT MODE OR VIEW MODE ── */}
      {isEditing ? (
        /* =====================================================
           EDIT MODE BENTO FORM
        ===================================================== */
        <form
          onSubmit={handleSave}
          className="rounded-[32px] border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <div>
              <span className="rounded-full border border-[#77af9c]/30 bg-[#E8F4F0] px-2.5 py-0.5 text-[10px] font-bold text-[#285943]">
                Edit Mode
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Update Patient Profile
              </h2>
              <p className="text-xs text-stone-500">
                Modify your personal information and biometric records.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-2xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* AVATAR UPLOAD */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-stone-100 pb-6">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[#DDF4EC] shadow-md ring-1 ring-stone-200">
                {avatarPreview ? (
                  <img
                    src={`http://localhost:5000${avatarPreview}`}
                    alt={formData.fullName || "Patient"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#285943]">
                    {initials}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#FA6432] text-white shadow-md transition-transform hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
              <p className="text-xs text-stone-500">
                Upload a clear portrait (PNG, JPG, or WEBP under 5MB).
              </p>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                required
              />

              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                icon={Calendar}
              />

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  ["", "Select Gender"],
                  ["Male", "Male"],
                  ["Female", "Female"],
                  ["Other", "Other"],
                ]}
              />
            </div>
          </div>

          {/* HEALTH VITALS */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Health Information &amp; Biometrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                label="Blood Group"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                options={[
                  ["", "Select Blood Group"],
                  ["A+", "A+"],
                  ["A-", "A-"],
                  ["B+", "B+"],
                  ["B-", "B-"],
                  ["AB+", "AB+"],
                  ["AB-", "AB-"],
                  ["O+", "O+"],
                  ["O-", "O-"],
                ]}
              />

              <FormInput
                label="Height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 175 cm"
                icon={Ruler}
              />

              <FormInput
                label="Weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 70 kg"
                icon={Weight}
              />
            </div>

            <div className="pt-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Known Allergies
              </label>
              <input
                type="text"
                value={formData.allergies.join(", ")}
                onChange={handleAllergiesChange}
                placeholder="e.g. Penicillin, Pollen, Peanuts (comma separated)"
                className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-xs text-slate-800 outline-none transition placeholder:text-stone-400 focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20"
              />
              <p className="mt-1 text-[11px] text-stone-400">
                Separate multiple items with commas.
              </p>
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Emergency Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Contact Name"
                name="name"
                value={formData.emergencyContact.name}
                onChange={handleEmergencyChange}
                icon={User}
                placeholder="Full name"
              />

              <FormSelect
                label="Relationship"
                name="relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleEmergencyChange}
                options={[
                  ["", "Select Relationship"],
                  ["Parent", "Parent"],
                  ["Spouse", "Spouse"],
                  ["Sibling", "Sibling"],
                  ["Child", "Child"],
                  ["Friend", "Friend"],
                  ["Other", "Other"],
                ]}
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={handleEmergencyChange}
                icon={Phone}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#FA6432] hover:bg-[#e45222] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* =====================================================
           VIEW MODE BENTO SUITE
        ====================================================== */
        <div className="space-y-6">
          
          {/* PROFILE HERO BENTO TILE */}
          <div className="rounded-4xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Avatar circle */}
              <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#F7F8F5] bg-[#DDF4EC] shadow-md">
                {profile.avatar ? (
                  <img
                    src={`http://localhost:5000${profile.avatar}`}
                    alt={profile.fullName || "Patient"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl sm:text-4xl font-bold text-[#285943]">
                    {initials}
                  </div>
                )}
              </div>

              {/* Title & Patient Tag */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl capitalize font-bold text-slate-900">
                    {profile.fullName || "Patient"}
                  </h2>
                  <span className="rounded-full border border-[#8cd790]/50 bg-[#DDF4EC] px-3 py-0.5 text-[11px] font-bold text-[#285943]">
                    {profile.role || "Patient"}
                  </span>
                </div>

                <p className="text-xs text-stone-500">
                  Patient Portal ID: #{profile._id?.slice(-6).toUpperCase() || "MED-01"}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 pt-1">
                  {profile.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-[#77af9c]" />
                      <span>{profile.email}</span>
                    </span>
                  )}
                  {profile.phone && (
                    <>
                      <span className="text-stone-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-[#77af9c]" />
                        <span>{profile.phone}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stat Pill Chips */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-stone-200 bg-[#FAFBF9] px-4 py-3 text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Blood
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {profile.bloodType || "—"}
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-[#FAFBF9] px-4 py-3 text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Weight
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {profile.weight || "—"}
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-[#FAFBF9] px-4 py-3 text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Height
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {profile.height || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* INFORMATION BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* PERSONAL DETAILS (8 Cols) */}
            <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-8">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#285943]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Personal Demographics
                    </h3>
                    <p className="text-xs text-stone-500">
                      Primary verified identity details
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                  verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                />
                <InfoItem
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone Number"
                  value={profile.phone}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : ""
                  }
                />
                <InfoItem
                  icon={Users}
                  label="Gender"
                  value={
                    profile.gender
                      ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                      : ""
                  }
                />
                <InfoItem
                  icon={Activity}
                  label="Portal Status"
                  value="Active Primary Care"
                />
              </div>
            </div>

            {/* HEALTH SNAPSHOT (4 Cols) */}
            <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-5 lg:col-span-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FA6432]">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Health Snapshot
                  </h3>
                  <p className="text-xs text-stone-500">
                    Vitals &amp; Blood Marker
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <HealthItem
                  icon={Droplets}
                  label="Blood Group"
                  value={profile.bloodType}
                />
                <HealthItem
                  icon={Ruler}
                  label="Recorded Height"
                  value={profile.height}
                />
                <HealthItem
                  icon={Weight}
                  label="Recorded Weight"
                  value={profile.weight}
                />
              </div>
            </div>

          </div>

          {/* BOTTOM BENTO ROW: ALLERGIES & EMERGENCY CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KNOWN ALLERGIES */}
            <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FA6432]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Known Allergies
                      </h3>
                      <p className="text-xs text-stone-500">
                        Physician cross-reaction safety
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">
                    {profile.allergies?.length || 0} Listed
                  </span>
                </div>

                {profile.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-[#FAFBF9] p-5 text-center text-xs text-stone-400">
                    No active drug or food allergies on file.
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11px] text-stone-400 pt-3 border-t border-stone-100">
                Always alert your clinician before receiving injections or new prescriptions.
              </p>
            </div>

            {/* EMERGENCY CONTACT */}
            <div className="rounded-[30px] border border-stone-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#285943]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Emergency Contact
                      </h3>
                      <p className="text-xs text-stone-500">
                        Next of kin for critical notifications
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-stone-200 bg-[#F9FAF8] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                    primary
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-stone-100 bg-[#FAFBF9] p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Contact Person
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {profile.emergencyContact?.name || "Not provided"}
                      </p>
                    </div>
                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                      {profile.emergencyContact?.relationship || "Relative"}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-stone-100 bg-[#FAFBF9] p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Emergency Phone
                      </span>
                      <p className="text-sm font-bold text-[#285943] mt-0.5">
                        {profile.emergencyContact?.phone || "Not provided"}
                      </p>
                    </div>
                    <Phone className="h-4 w-4 text-[#77af9c]" />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-stone-400 pt-3 border-t border-stone-100">
                Authorized for medical communications in case of incapacitation.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ── 4. FOOTER PRIVACY NOTICE ── */}
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white/70 px-5 py-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#77af9c]" />
          <span>Patient identity and vital records are stored encrypted in compliance with healthcare data protection standards.</span>
        </div>
      </div>

    </div>
  );
};

/* =========================================================
   FORM INPUT PILL
========================================================= */

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon: Icon,
  required = false,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-2xl border border-stone-200 bg-white py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-stone-400 focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20 shadow-2xs ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

/* =========================================================
   FORM SELECT PILL
========================================================= */

const FormSelect = ({ label, name, value, onChange, options }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#77af9c] focus:ring-2 focus:ring-[#77af9c]/20 shadow-2xs"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
};

/* =========================================================
   INFO ITEM CARD
========================================================= */

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-stone-100 bg-[#FAFBF9] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#285943] shadow-2xs border border-stone-200/60">
        <Icon className="h-4 w-4 text-[#77af9c]" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   HEALTH ITEM CARD
========================================================= */

const HealthItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-100 bg-[#FAFBF9] p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#285943] shadow-2xs border border-stone-200/60">
          <Icon className="h-4 w-4 text-[#77af9c]" />
        </div>
        <span className="text-xs font-semibold text-stone-600">
          {label}
        </span>
      </div>

      <span className="text-xs font-bold text-slate-900 rounded-full bg-white px-3 py-1 border border-stone-200/70 shadow-2xs">
        {value || "—"}
      </span>
    </div>
  );
};

export default Profile;