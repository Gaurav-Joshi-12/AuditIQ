import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Database, AlertTriangle,
  MessageSquare, BarChart3, Shield, FileText, ChevronLeft, ChevronRight,
  Inbox, Building2, LogOut
} from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';

const orgNavItems = [
  { to: '/org/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/org/upload', icon: Upload, label: 'Upload Data' },
  { to: '/org/reports', icon: FileText, label: 'Reports & Insights' },
  { to: '/org/analytics', icon: BarChart3, label: 'Analytics Dashboard' },
  { to: '/org/explorer', icon: Database, label: 'Data Explorer' },
];

const auditorNavItems = [
  { to: '/auditor/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
  { to: '/auditor/ingestion', icon: Upload, label: 'Data Ingestion' },
  { to: '/auditor/explorer', icon: Database, label: 'Data Explorer' },
  { to: '/auditor/transactions', icon: AlertTriangle, label: 'Flagged Exceptions' },
  { to: '/auditor/risk', icon: Shield, label: 'Risk Analysis' },
  { to: '/auditor/vendors', icon: BarChart3, label: 'Vendor Insights' },
  { to: '/auditor/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/auditor/reports', icon: FileText, label: 'Reports' },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useAuditStore(s => s.userRole);

  const navItems = userRole === 'organization' ? orgNavItems : auditorNavItems;
  const portalLabel = userRole === 'organization' ? 'Organization' : 'Auditor';

  return (
    <aside className={`flex flex-col border-r border-border bg-card h-screen sticky top-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-base font-bold tracking-tight text-foreground">AuditIQ</span>
          </div>
        )}
        {collapsed && <Shield className="h-6 w-6 text-primary mx-auto" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-md hover:bg-accent text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Portal Badge */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[9px] font-semibold text-primary uppercase tracking-widest">{portalLabel} Portal</span>
        </div>
      )}

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={() => {
              const isActive = location.pathname === item.to;
              return `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`;
            }}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-2 border-t border-border space-y-1">
        <button
          onClick={() => {
            useAuditStore.getState().setRole('none');
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Switch Portal</span>}
        </button>
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 pt-1">
            Deloitte Hacksplosion 2026
          </p>
        )}
      </div>
    </aside>
  );
};
