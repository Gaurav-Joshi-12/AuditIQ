import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '@/store/audit-store';
import { Shield, Building2, UserCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const { setRole, loadFromBackend, setCurrentOrg, organizations } = useAuditStore();
  const [loading, setLoading] = useState(false);

  const handleSelect = (role: 'organization' | 'auditor' | 'simulation') => {
    if (role === 'simulation') {
      navigate('/simulation');
    } else {
      navigate(`/auth?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AuditIQ</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Intelligent Oversight for the Modern Ledger. Select your portal to continue.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Connecting to backend...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {/* Organization Portal */}
          <button
            onClick={() => handleSelect('organization')}
            className="group relative bg-card border border-border rounded-xl p-8 text-left hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Organization Portal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Upload your company's financial data, track submission status, and view audit reports and insights once your data has been processed.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              <span>Enter as Organization</span>
              <ArrowRight size={16} />
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Auditor Portal */}
          <button
            onClick={() => handleSelect('auditor')}
            className="group relative bg-card border border-border rounded-xl p-8 text-left hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <UserCheck className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Auditor Portal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Manage client submissions, run AI-powered audit analysis, review flagged exceptions, generate reports, and distribute findings.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              <span>Enter as Auditor</span>
              <ArrowRight size={16} />
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Simulation Portal */}
          <button
            onClick={() => handleSelect('simulation')}
            className="group relative bg-card border border-border rounded-xl p-8 text-left hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Flowchart Simulation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Visualize the end-to-end multi-agent AI pipeline. Watch how data flows from ingestion through GenWAI agents to final reports.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              <span>View Simulation</span>
              <ArrowRight size={16} />
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-12">
        Deloitte Hacksplosion 2026
      </p>
    </div>
  );
};

export default RoleSelectPage;
