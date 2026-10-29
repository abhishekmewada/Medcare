import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Search,
  Ban,
  Trash2,
  Eye,
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

import {
  fetchAllPatients,
  toggleUserBlock,
  deleteUser,
} from "../../redux/slice/adminSlice";

export default function PatientManagement() {
  const dispatch = useDispatch();
  const { patients, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    dispatch(fetchAllPatients());
  }, [dispatch]);

  const handleToggleBlock = (id) => {
    if (window.confirm("Are you sure you want to change this patient's block status?")) {
      dispatch(toggleUserBlock(id));
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "CRITICAL WARNING: This will permanently delete this patient user. Continue?"
      )
    ) {
      dispatch(deleteUser(id));
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "active") return !patient.isBlocked;
    if (activeTab === "blocked") return patient.isBlocked;

    return true;
  });

  const activeCount = patients.filter((p) => !p.isBlocked).length;
  const blockedCount = patients.filter((p) => p.isBlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-[#40798c]" size={28} />
            Patient Accounts Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor registered patients, view account details, manage block states, and maintain platform security.
          </p>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#1f363d] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "active"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Active Accounts ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "blocked"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Blocked Accounts ({blockedCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c]"
          />
        </div>
      </div>

      {/* PATIENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Patient Name</th>
                <th className="py-3.5 px-4">Contact Information</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading patient database...
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#40798c] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {patient.fullName?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {patient.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Role: Patient
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        {patient.email}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone size={12} className="text-slate-400" />
                        {patient.phone || "Not specified"}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      {patient.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <Ban size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <ShieldCheck size={12} /> Active
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="p-1.5 text-slate-500 hover:text-[#40798c] hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Patient Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleBlock(patient._id)}
                        disabled={actionLoading}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                          patient.isBlocked
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                        }`}
                      >
                        {patient.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => handleDelete(patient._id)}
                        disabled={actionLoading}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No patients match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PATIENT DETAIL MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-[#40798c] text-white flex items-center justify-center font-bold text-xl">
                {selectedPatient.fullName?.charAt(0).toUpperCase() || "P"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPatient.fullName}
                </h3>
                <p className="text-xs text-slate-500">{selectedPatient.email}</p>
                <div className="mt-1">
                  {selectedPatient.isBlocked ? (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                      Account Blocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      Active Account
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Contact Number</span>
                <span className="font-bold text-slate-800">
                  {selectedPatient.phone || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Joined Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedPatient.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-[10px] text-slate-600">
                  {selectedPatient._id}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
