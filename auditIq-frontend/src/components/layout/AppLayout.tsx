import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopNav } from './TopNav';
import { useAuditStore } from '@/store/audit-store';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const userRole = useAuditStore(s => s.userRole);
  const navigate = useNavigate();

  // If user refreshes and no role is set, redirect to landing page
  useEffect(() => {
    if (userRole === 'none') {
      navigate('/');
    }
  }, [userRole, navigate]);

  if (userRole === 'none') return null;

  return (
    <div className="flex min-h-screen bg-surface">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
