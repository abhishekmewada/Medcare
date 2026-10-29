import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminChatWidget from "../components/admin/AdminChatWidget";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans antialiased">
      {/* Admin Top Navigation / Header */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
        <Outlet />
      </main>

      {/* Fixed Floating Live Doctor <-> Admin Socket.IO Chat Widget */}
      <AdminChatWidget />
    </div>
  );
}
