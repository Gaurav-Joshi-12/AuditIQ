import { useAuditStore } from '@/store/audit-store';
import { Building2, Clock, CheckCircle2, FileText, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrgDashboardPage = () => {
  const navigate = useNavigate();
  const currentOrgId = useAuditStore(s => s.currentOrgId);
  const submissions = useAuditStore(s => s.submissions);
  const organizations = useAuditStore(s => s.organizations);

  const org = organizations.find(o => o.id === currentOrgId);
  const orgSubs = submissions.filter(s => s.orgId === currentOrgId);
  const reportReadySubs = orgSubs.filter(s => s.status === 'completed' && s.emailSent);
  const pendingSubs = orgSubs.filter(s => s.status !== 'completed' || !s.emailSent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Welcome, {org?.name || 'Organization'}</h2>
        <p className="text-sm text-muted-foreground mt-1">Track your data submissions and view audit reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Submissions</span>
              <p className="text-2xl font-bold font-mono text-foreground">{orgSubs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reports Ready</span>
              <p className="text-2xl font-bold font-mono text-foreground">{reportReadySubs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-bold font-mono text-foreground">{pendingSubs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions History */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Submission History</h3>
          <button
            onClick={() => navigate('/org/upload')}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            + New Submission
          </button>
        </div>
        {orgSubs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No submissions yet</p>
            <p className="text-xs mt-1">Upload your financial data to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orgSubs.map(sub => {
              let statusLabel = 'Pending Review';
              let statusClass = 'bg-warning/10 text-warning';
              if (sub.status === 'processing') {
                statusLabel = 'Processing';
                statusClass = 'bg-primary/10 text-primary';
              } else if (sub.status === 'completed' && !sub.emailSent) {
                statusLabel = 'Awaiting Report';
                statusClass = 'bg-primary/10 text-primary';
              } else if (sub.status === 'completed' && sub.emailSent) {
                statusLabel = 'Report Ready';
                statusClass = 'bg-success/10 text-success';
              }

              return (
                <div key={sub.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center">
                      <FileText size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.fileName}</p>
                      <p className="text-xs text-muted-foreground">{sub.rowCount} rows · {new Date(sub.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusClass}`}>
                      {statusLabel}
                    </span>
                    {sub.status === 'completed' && sub.emailSent && (
                      <button
                        onClick={() => navigate('/org/reports')}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View Report <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgDashboardPage;
