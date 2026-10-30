import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  Search,
  Stethoscope,
  ShieldCheck,
  Eye,
  X,
} from "lucide-react";

import { fetchAdminConversations } from "../../redux/slice/adminSlice";

// Helper to resolve backend image URLs
import { getImageUrl } from "../../utiles/imageURL";
const resolveAvatarUrl = getImageUrl; // alias for backward compatibility

export default function AdminChat() {
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminConversations());
  }, [dispatch]);

  const filteredConversations = conversations.filter((conv) => {
    const pName = conv.patient?.fullName?.toLowerCase() || "";
    const dName = conv.doctor?.fullName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return pName.includes(search) || dName.includes(search);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-[#40798c]" size={28} />
            Live Chat Oversight & Compliance Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Governance window monitoring doctor-patient message telemetry and live consultation logs.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search active conversation by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c]"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Total Conversations: {conversations.length}
        </div>
      </div>

      {/* CONVERSATIONS LIST */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Patient User</th>
                <th className="py-3.5 px-4">Attending Doctor</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Compliance Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading live chat telemetry...
                  </td>
                </tr>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <tr key={conv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#40798c] text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                          {conv.patient?.avatar ? (
                            <img
                              src={resolveAvatarUrl(conv.patient.avatar)}
                              alt={conv.patient?.fullName || "Patient"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            conv.patient?.fullName?.charAt(0).toUpperCase() || "P"
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {conv.patient?.fullName || "Patient User"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {conv.patient?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-slate-200">
                          {conv.doctor?.avatar ? (
                            <img
                              src={resolveAvatarUrl(conv.doctor.avatar)}
                              alt={conv.doctor?.fullName || "Doctor"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            conv.doctor?.fullName?.charAt(0).toUpperCase() || "D"
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Stethoscope size={13} className="text-[#40798c]" />
                            {conv.doctor?.fullName || "Doctor"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {conv.doctor?.specialty || "Practitioner"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {new Date(conv.lastMessageAt || conv.updatedAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <ShieldCheck size={12} /> Encrypted & Audited
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedChat(conv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> Audit Telemetry
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No active chat threads match the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHAT OVERVIEW MODAL */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedChat(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Conversation Telemetry Record
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Patient
                </span>
                <p className="font-bold text-slate-900">
                  {selectedChat.patient?.fullName} ({selectedChat.patient?.email})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Doctor
                </span>
                <p className="font-bold text-slate-900">
                  {selectedChat.doctor?.fullName} ({selectedChat.doctor?.specialty})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Conversation ID
                </span>
                <p className="font-mono text-slate-600 text-[10px]">
                  {selectedChat._id}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedChat(null)}
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
