import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, AlertTriangle, ShieldAlert, FileWarning } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';

export const TopNav = () => {
  const userRole = useAuditStore(s => s.userRole);
  const hasData = useAuditStore(s => s.hasData);
  const metrics = useAuditStore(s => s.metrics);
  const flaggedTransactions = useAuditStore(s => s.flaggedTransactions);
  const organizations = useAuditStore(s => s.organizations);
  const currentOrgId = useAuditStore(s => s.currentOrgId);
  const activeSubmissionId = useAuditStore(s => s.activeSubmissionId);
  const submissions = useAuditStore(s => s.submissions);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine header title
  let headerTitle = 'AI Audit Workspace';
  if (userRole === 'organization') {
    const org = organizations.find(o => o.id === currentOrgId);
    headerTitle = org ? `${org.name} Portal` : 'Organization Portal';
  } else if (userRole === 'auditor') {
    const activeSub = submissions.find(s => s.id === activeSubmissionId);
    headerTitle = activeSub
      ? `Auditor Workspace · ${activeSub.orgName}`
      : 'Auditor Workspace';
  }

  const notifications = hasData && metrics ? [
    {
      id: 1, icon: ShieldAlert, color: 'text-destructive',
      title: 'Critical Risk Detected',
      desc: `${flaggedTransactions.filter(f => f.risk_tier === 'Critical').length} transactions flagged as critical risk.`,
      time: 'Just now'
    },
    {
      id: 2, icon: AlertTriangle, color: 'text-warning',
      title: 'High-Risk Vendor Alert',
      desc: `${metrics.high_risk_vendors} vendors exceeding acceptable risk thresholds.`,
      time: '15 mins ago'
    },
    {
      id: 3, icon: FileWarning, color: 'text-primary',
      title: 'Anomaly Pattern Detected',
      desc: `AI detected unusual posting patterns in ${flaggedTransactions.slice(0, 1)[0]?.category || 'General'} category.`,
      time: '1 hour ago'
    }
  ] : [];

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-foreground">{headerTitle}</h1>
        {hasData && metrics && (
          <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-md">
            {metrics.total_transactions.toLocaleString()} transactions loaded
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {userRole === 'auditor' && (
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={useAuditStore(s => s.searchQuery)}
              onChange={(e) => useAuditStore.getState().setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="h-8 w-56 rounded-md border border-border bg-surface pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-md transition-colors ${showNotifications ? 'bg-accent text-accent-foreground' : 'hover:bg-accent text-muted-foreground'}`}
          >
            <Bell size={16} />
            {hasData && metrics && metrics.flagged_count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-surface">
                <span className="text-sm font-semibold text-foreground">Audit Alerts</span>
                {hasData && <span className="text-xs text-primary cursor-pointer hover:underline">Mark all as read</span>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {hasData && notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-surface/50 cursor-pointer transition-colors flex gap-3 items-start">
                        <div className={`mt-0.5 p-1.5 rounded-full bg-surface ${notif.color}`}>
                          <notif.icon size={14} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-foreground">{notif.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{notif.desc}</p>
                          <p className="text-[10px] text-muted-foreground/50 pt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No new alerts to display at this time.
                  </div>
                )}
              </div>
              {hasData && (
                <div className="px-4 py-2 border-t border-border text-center bg-surface">
                  <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View all alerts</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <User size={14} className="text-primary-foreground" />
        </div>
      </div>
    </header>
  );
};
