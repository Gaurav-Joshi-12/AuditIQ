import { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';
import { useNavigate } from 'react-router-dom';

const OrgUploadPage = () => {
  const navigate = useNavigate();
  const currentOrgId = useAuditStore(s => s.currentOrgId);
  const submitOrgData = useAuditStore(s => s.submitOrgData);
  const organizations = useAuditStore(s => s.organizations);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const org = organizations.find(o => o.id === currentOrgId);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => navigate('/org/dashboard'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleFileInput = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentOrgId) return;

    const file = files[0];
    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg('');

    try {
      await submitOrgData(currentOrgId, file);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message ?? 'Upload failed. Please check the backend is running.');
    }
  };

  if (status === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Uploading to Backend...</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
          <strong>{fileName}</strong> is being processed by the AI pipeline. Please wait.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Data Submitted Successfully</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
          <strong>{fileName}</strong> has been submitted for audit review. You will be redirected to your dashboard.
        </p>
        <div className="mt-4 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-semibold uppercase tracking-wider">
          Pending Auditor Review
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Upload Failed</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">{errorMsg}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Upload Financial Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Submit {org?.name ?? 'your company'}'s ledger files for AI-powered audit analysis
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Drop Excel / CSV Files
        </h3>
        <div
          onClick={() => document.getElementById('org-file-input')?.click()}
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer border-border hover:border-primary/50 transition-colors"
        >
          <Upload size={36} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Drag & Drop Files Here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse (.xlsx, .csv)</p>
          <input
            id="org-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFileInput(e.target.files)}
          />
        </div>

        <div className="mt-4 space-y-2">
          {['Purchase Ledger', 'Sales Ledger', 'General Ledger', 'Vendor Data'].map(label => (
            <button
              key={label}
              onClick={() => document.getElementById('org-file-input')?.click()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md border border-border hover:bg-surface transition-colors text-left"
            >
              <FileSpreadsheet size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Upload {label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => document.getElementById('org-file-input')?.click()}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <CheckCircle2 size={16} />
          Select & Upload File
        </button>
      </div>
    </div>
  );
};

export default OrgUploadPage;
