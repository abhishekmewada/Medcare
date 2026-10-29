import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Stethoscope,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Ban,
  Trash2,
  Eye,
  Filter,
  UserCheck,
  Building2,
  Award,
  Calendar,
  AlertCircle,
  X,
  Unlock,
} from "lucide-react";

import {
  fetchAllDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctorStatus,
  toggleUserBlock,
  deleteUser,
} from "../../redux/slice/adminSlice";

export default function DoctorManagement() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";

  const { doctors, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "all" ? {} : { tab });
  };

  const handleApprove = (id) => {
    dispatch(approveDoctor(id));
  };

  const handleOpenReject = (doc) => {
    setRejectModalDoc(doc);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectModalDoc) return;
    dispatch(
      rejectDoctor({ id: rejectModalDoc._id, reason: rejectReason })
    );
    setRejectModalDoc(null);
  };

  const handleToggleBlock = (id) => {
    if (window.confirm("Are you sure you want to change this doctor's account access status?")) {
      dispatch(toggleUserBlock(id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateDoctorStatus({ id, status: newStatus }));
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "CRITICAL WARNING: This will permanently delete this doctor account. Continue?"
      )
    ) {
      dispatch(deleteUser(id));
    }
  };

  // Filter logic
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "pending") return !doc.isApproved && !doc.isBlocked;
    if (activeTab === "approved") return doc.isApproved && !doc.isBlocked;
    if (activeTab === "blocked") return doc.isBlocked;

    return true;
  });

  const pendingCount = doctors.filter((d) => !d.isApproved && !d.isBlocked).length;
  const approvedCount = doctors.filter((d) => d.isApproved && !d.isBlocked).length;
  const blockedCount = doctors.filter((d) => d.isBlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="text-[#40798c]" size={28} />
            Doctor Management & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review medical credentials, approve practitioner licenses, manage active statuses, and enforce platform security.
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#1f363d] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            onClick={() => handleTabChange("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-900 shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Pending Verification ({pendingCount})
          </button>
          <button
            onClick={() => handleTabChange("approved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Verified Active ({approvedCount})
          </button>
          <button
            onClick={() => handleTabChange("blocked")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "blocked"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Suspended / Blocked ({blockedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctor name, email, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c] transition-all"
          />
        </div>
      </div>

      {/* DOCTORS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Doctor Information</th>
                <th className="py-3.5 px-4">Specialty & License</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4">Account Access</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading doctors directory...
                  </td>
                </tr>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1f363d] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {doc.fullName?.charAt(0).toUpperCase() || "D"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{doc.fullName}</span>
                            {doc.isApproved && (
                              <UserCheck size={14} className="text-emerald-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{doc.email}</div>
                          <div className="text-[10px] text-slate-400">{doc.phone || "No phone"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">
                        {doc.specialty || "General Practitioner"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Experience: {doc.experience || 5}+ years
                      </div>
                    </td>

                        {/* Verification */}
                        <td className="py-4 px-4">
                          {doc.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          ) : doc.rejectReason ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <Ban size={12} /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              <AlertCircle size={12} /> Pending Review
                            </span>
                          )}
                        </td>

                    {/* Account Access */}
                    <td className="py-4 px-4">
                      {doc.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <Ban size={12} /> Blocked / Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDoctor(doc)}
                        className="p-1.5 text-slate-500 hover:text-[#40798c] hover:bg-slate-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>

                      {!doc.isApproved && !doc.isBlocked && (
                        <>
                          <button
                            onClick={() => handleApprove(doc._id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button title="Reject doctor"
                            onClick={() => handleOpenReject(doc)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors"
                          >
                            <Ban size={12} className="inline mr-1" /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleToggleBlock(doc._id)}
                        disabled={actionLoading}
                        title={doc.isBlocked ? "Unblock doctor" : "Block doctor"}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                          doc.isBlocked
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                        }`}
                      >
                        {doc.isBlocked ? <Unlock size={14} className="inline mr-1" /> : null}
                        {doc.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={actionLoading}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Doctor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No doctor records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCTOR DETAILS MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1f363d] text-white flex items-center justify-center font-bold text-xl">
                {selectedDoctor.fullName?.charAt(0).toUpperCase() || "D"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDoctor.fullName}
                </h3>
                <p className="text-xs text-slate-500">{selectedDoctor.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    {selectedDoctor.specialty || "Specialist"}
                  </span>
                  {selectedDoctor.isApproved ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-bold text-slate-800">
                  {selectedDoctor.phone || "Not provided"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Experience Years</span>
                <span className="font-bold text-slate-800">
                  {selectedDoctor.experience || 5} Years
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-bold text-slate-800">
                  ${selectedDoctor.fees || 100} / session
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Registration Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT DOCTOR REASON MODAL */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Reject Credential Verification
            </h3>
            <p className="text-xs text-slate-500">
              Provide an official reason for rejecting {rejectModalDoc.fullName}'s doctor profile application.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Invalid medical license registration number, incomplete documents..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalDoc(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
