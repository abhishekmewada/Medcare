import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorChat from '../components/doctor/DoctorChat';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased overflow-x-hidden">
      <DoctorSidebar />

      {/* Main area */}
      <div>
        <main>
          <Outlet />
        </main>
      </div>

      {/* Real-time Unified Doctor Chat widget (Patients & Admin support) */}
      <DoctorChat />
    </div>
  );
}
