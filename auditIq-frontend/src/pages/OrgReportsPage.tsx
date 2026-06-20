import { useAuditStore } from '@/store/audit-store';
import { FileText, Download, ShieldCheck, AlertTriangle, TrendingUp, BarChart3, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrgReportsPage = () => {
  const navigate = useNavigate();
  const currentOrgId = useAuditStore(s => s.currentOrgId);
  const submissions = useAuditStore(s => s.submissions);
  const loadSubmissionResults = useAuditStore(s => s.loadSubmissionResults);

  // Only show reports that the auditor has emailed to the org
  const emailedSubs = submissions.filter(s => s.orgId === currentOrgId && s.status === 'completed' && s.emailSent);
  const pendingSubs = submissions.filter(s => s.orgId === currentOrgId && (s.status === 'pending' || s.status === 'processing'));
  const awaitingEmailSubs = submissions.filter(s => s.orgId === currentOrgId && s.status === 'completed' && !s.emailSent);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Audit Reports & Insights</h2>
          <p className="text-sm text-muted-foreground mt-1">Key findings from your completed audits</p>
        </div>
        {emailedSubs.length > 0 && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download size={14} />
            Download as PDF
          </button>
        )}
      </div>

      {/* Pending items notification */}
      {pendingSubs.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-warning/5 border border-warning/20">
          <Mail size={16} className="text-warning" />
          <p className="text-sm text-foreground">
            <strong>{pendingSubs.length} submission{pendingSubs.length > 1 ? 's' : ''}</strong> pending auditor review. Reports will appear here once the analysis is complete and the auditor shares them with you.
          </p>
        </div>
      )}

      {/* Awaiting email items notification */}
      {awaitingEmailSubs.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
          <Mail size={16} className="text-primary" />
          <p className="text-sm text-foreground">
            <strong>{awaitingEmailSubs.length} audit{awaitingEmailSubs.length > 1 ? 's' : ''}</strong> completed — awaiting auditor to share the report with your organization.
          </p>
        </div>
      )}

      {emailedSubs.length === 0 && pendingSubs.length === 0 && awaitingEmailSubs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold text-foreground">No Reports Available</h2>
          <p className="text-sm mt-1">Your audit reports will appear here once the auditor completes the analysis and shares them.</p>
        </div>
      )}

      {/* Completed & Emailed Reports */}
      {emailedSubs.map(sub => {
        const m = sub.metrics;
        if (!m) return null;

        const criticalCount = sub.flaggedTransactions?.filter(f => f.risk_tier === 'Critical').length || 0;
        const moderateCount = sub.flaggedTransactions?.filter(f => f.risk_tier === 'Moderate').length || 0;

        return (
          <div key={sub.id} className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            {/* Report Header */}
            <div className="px-6 py-5 border-b border-border bg-surface/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{sub.fileName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processed on {new Date(sub.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {sub.rowCount} transactions analyzed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wider">
                    Audit Complete
                  </span>
                  <button
                    onClick={() => {
                      loadSubmissionResults(sub.id);
                      navigate('/org/analytics');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <BarChart3 size={12} />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-0 divide-x divide-border border-b border-border">
              {[
                { label: 'Total Transactions', value: m.total_transactions.toLocaleString(), icon: BarChart3, color: 'text-primary' },
                { label: 'Flagged Exceptions', value: m.flagged_count.toString(), icon: AlertTriangle, color: 'text-destructive' },
                { label: 'Avg Risk Score', value: `${m.avg_risk_score}/100`, icon: TrendingUp, color: 'text-warning' },
                { label: 'High-Risk Vendors', value: m.high_risk_vendors.toString(), icon: ShieldCheck, color: 'text-destructive' },
              ].map(item => (
                <div key={item.label} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={13} className={item.color} />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold font-mono text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Key Findings */}
            <div className="px-6 py-5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key Audit Findings</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/10">
                  <AlertTriangle size={16} className="text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {criticalCount} Critical Risk Transaction{criticalCount !== 1 ? 's' : ''} Identified
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      These transactions require immediate review due to high-severity anomaly patterns including duplicate invoices and statistical outliers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-warning/5 border border-warning/10">
                  <TrendingUp size={16} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {moderateCount} Moderate Risk Entries Flagged
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Moderate risk items include round-number transactions, weekend postings, and vendor concentration anomalies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5 border border-primary/10">
                  <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      ₹{(m.total_fraud_amount / 100000).toFixed(1)}L Total Flagged Amount
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cumulative value of all flagged transactions. Recommend cross-referencing with source documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrgReportsPage;
