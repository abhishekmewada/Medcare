import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorChat from '../components/doctor/DoctorChat';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen overflow-hidden">
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
