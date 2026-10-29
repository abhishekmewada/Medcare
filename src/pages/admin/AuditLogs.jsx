import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldAlert,
  Search,
  Clock,
  User,
  Activity,
  Terminal,
  Filter,
} from "lucide-react";

import { fetchAuditLogs } from "../../redux/slice/adminSlice";

export default function AuditLogs() {
  const dispatch = useDispatch();
  const { auditLogs, loading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const filteredLogs = auditLogs.filter((log) => {
    const text = `${log.action} ${log.entity} ${log.description} ${log.user?.fullName} ${log.ipAddress}`.toLowerCase();
    const searchMatch = text.includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    if (actionFilter !== "all") {
      return log.action === actionFilter;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-[#40798c]" size={28} />
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log stream tracking all administrator actions, doctor verification updates, and security events.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Action:</span>
          {["all", "approve", "reject", "block", "unblock", "delete"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                actionFilter === act
                  ? "bg-[#1f363d] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c]"
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-4">Admin / User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-6">Description & Context</th>
                <th className="py-3.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900">
                      {log.user?.fullName || "System Admin"}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Role: {log.user?.role || "admin"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          log.action === "approve"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "reject" || log.action === "delete"
                            ? "bg-rose-100 text-rose-800"
                            : log.action === "block"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-700">
                      {log.description}
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit logs recorded for this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
