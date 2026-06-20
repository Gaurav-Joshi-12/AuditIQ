import { useAuditStore } from '@/store/audit-store';
import { Building2, FileCheck, Clock, AlertTriangle, BarChart3, Shield } from 'lucide-react';

const AuditorDashboardPage = () => {
  const submissions = useAuditStore(s => s.submissions);
  const organizations = useAuditStore(s => s.organizations);

  const completed = submissions.filter(s => s.status === 'completed');
  const pending = submissions.filter(s => s.status === 'pending');
  const totalTransactions = completed.reduce((sum, s) => sum + s.rowCount, 0);
  const totalFlagged = completed.reduce((sum, s) => sum + (s.metrics?.flagged_count || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Auditor Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Cross-client overview of all audit engagements</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Client Organizations', value: organizations.length.toString(), icon: Building2, color: 'bg-primary/10 text-primary' },
          { label: 'Pending Submissions', value: pending.length.toString(), icon: Clock, color: 'bg-warning/10 text-warning' },
          { label: 'Completed Audits', value: completed.length.toString(), icon: FileCheck, color: 'bg-success/10 text-success' },
          { label: 'Total Exceptions', value: totalFlagged.toLocaleString(), icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
        ].map(item => (
          <div key={item.label} className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <p className="text-2xl font-bold font-mono text-foreground">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Summary Table */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Client Engagement Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface">
              <tr>
                {['Organization', 'Industry', 'Submissions', 'Status', 'Transactions Analyzed', 'Exceptions Found'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map(org => {
                const orgSubs = submissions.filter(s => s.orgId === org.id);
                const orgCompleted = orgSubs.filter(s => s.status === 'completed');
                const orgPending = orgSubs.filter(s => s.status === 'pending');
                const txnCount = orgCompleted.reduce((sum, s) => sum + s.rowCount, 0);
                const flagCount = orgCompleted.reduce((sum, s) => sum + (s.metrics?.flagged_count || 0), 0);

                return (
                  <tr key={org.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: org.logoColor }}>
                          {org.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{org.industry}</td>
                    <td className="px-5 py-3 text-sm font-mono text-foreground">{orgSubs.length}</td>
                    <td className="px-5 py-3">
                      {orgPending.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-semibold uppercase">{orgPending.length} Pending</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase">All Clear</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-foreground">{txnCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm font-mono text-destructive">{flagCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Transactions Analyzed</h3>
          <p className="text-3xl font-bold font-mono text-foreground">{totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {completed.length} completed audits</p>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exception Rate</h3>
          <p className="text-3xl font-bold font-mono text-foreground">
            {totalTransactions > 0 ? ((totalFlagged / totalTransactions) * 100).toFixed(1) : '0.0'}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{totalFlagged} flagged out of {totalTransactions.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboardPage;
