import { useAuditStore } from '@/store/audit-store';
import { useNavigate } from 'react-router-dom';
import { FileText, Play, Eye, Mail, Clock, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { AuditPipeline } from '@/components/pipeline/AuditPipeline';
import { toast } from 'sonner';

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const submissions = useAuditStore(s => s.submissions);
  const processSubmission = useAuditStore(s => s.processSubmission);
  const loadSubmissionResults = useAuditStore(s => s.loadSubmissionResults);
  const emailReport = useAuditStore(s => s.emailReport);
  const isProcessing = useAuditStore(s => s.isProcessing);
  const activeSubmissionId = useAuditStore(s => s.activeSubmissionId);
  const organizations = useAuditStore(s => s.organizations);

  const handleRunAnalysis = async (subId: string) => {
    await processSubmission(subId);
  };

  const handleViewReport = async (subId: string) => {
    await loadSubmissionResults(subId);
    navigate('/auditor/reports');
  };

  const handleEmailReport = async (subId: string) => {
    const sub = submissions.find(s => s.id === subId);
    const org = organizations.find(o => o.id === sub?.orgId);
    if (sub && org) {
      await emailReport(subId);
      toast.success(`Report shared with ${org.contactEmail}`, {
        description: `Audit report for "${sub.fileName}" has been shared with ${org.name}. The organization can now view their report.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Data Ingestion - Client Submissions</h2>
        <p className="text-sm text-muted-foreground mt-1">Select and process pending data files submitted by client organizations</p>
      </div>

      <AuditPipeline />

      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface">
              <tr>
                {['Organization', 'File Name', 'Date Submitted', 'Rows', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map(sub => {
                const org = organizations.find(o => o.id === sub.orgId);
                const isThisProcessing = isProcessing && activeSubmissionId === sub.id;

                return (
                  <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: org?.logoColor || '#666' }}
                        >
                          {org?.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sub.orgName}</p>
                          <p className="text-[10px] text-muted-foreground">{org?.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate max-w-48">{sub.fileName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                      {new Date(sub.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-foreground">{sub.rowCount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider w-fit ${
                          sub.status === 'completed' ? 'bg-success/10 text-success' :
                          sub.status === 'processing' ? 'bg-primary/10 text-primary' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {sub.status === 'completed' && <CheckCircle2 size={10} />}
                          {sub.status === 'processing' && <Loader2 size={10} className="animate-spin" />}
                          {sub.status === 'pending' && <Clock size={10} />}
                          {sub.status}
                        </span>
                        {sub.emailSent && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                            <MailCheck size={9} /> Report shared
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {(sub.status === 'pending' || (sub.status === 'processing' && !isProcessing)) && (
                          <button
                            onClick={() => handleRunAnalysis(sub.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity shadow-sm"
                          >
                            <Play size={10} fill="currentColor" />
                            {sub.status === 'processing' ? 'Resume Analysis' : 'Run Analysis'}
                          </button>
                        )}
                        {isThisProcessing && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                            <Loader2 size={12} className="animate-spin" />
                            Processing...
                          </span>
                        )}
                        {sub.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleViewReport(sub.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface transition-colors"
                            >
                              <Eye size={12} />
                              View Report
                            </button>
                            {!sub.emailSent ? (
                              <button
                                onClick={() => handleEmailReport(sub.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                              >
                                <Mail size={12} />
                                Send to Org
                              </button>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-semibold">
                                <MailCheck size={12} />
                                Sent
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;
