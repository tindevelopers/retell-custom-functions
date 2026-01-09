import { ReactNode } from 'react';
import { AuthGuard } from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</div>
      </div>
    </AuthGuard>
  );
}


