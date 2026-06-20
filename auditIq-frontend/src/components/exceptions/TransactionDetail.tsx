import { X, ShieldAlert, FileText, Search as SearchIcon, CheckCircle } from 'lucide-react';
import type { FlaggedTransaction } from '@/lib/types';
import { useAuditStore } from '@/store/audit-store';

interface Props {
  transaction: FlaggedTransaction;
  onClose: () => void;
}

export const TransactionDetail = ({ transaction: t, onClose }: Props) => {
  const updateStatus = useAuditStore(s => s.updateFlaggedStatus);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/10" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-lg overflow-y-auto animate-professional"
        style={{ animation: 'slideIn 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Transaction Detail</h2>
            <span className="text-xs font-mono text-muted-foreground">{t.transaction_id}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Score Gauge */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4"
              style={{ borderColor: t.risk_score > 70 ? '#ef4444' : t.risk_score > 30 ? '#f59e0b' : '#94a3b8' }}>
              <div>
                <span className="text-2xl font-bold font-mono text-foreground">{t.risk_score}</span>
                <span className="text-xs text-muted-foreground block">/100</span>
              </div>
            </div>
            <p className="text-xs font-semibold mt-2" style={{ color: t.risk_score > 70 ? '#ef4444' : t.risk_score > 30 ? '#f59e0b' : '#94a3b8' }}>
              {t.risk_tier} Risk
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Vendor', t.vendor_name],
              ['Amount', `₹${t.amount.toLocaleString('en-IN')}`],
              ['Date', t.date],
              ['Category', t.fraud_category],
              ['Ledger', t.ledger_type],
              ['Confidence', `${(t.confidence_score * 100).toFixed(0)}%`],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface rounded-md px-3 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                <p className="text-sm font-medium text-foreground mt-0.5 font-mono">{value}</p>
              </div>
            ))}
          </div>

          {/* AI Narrative */}
          <div className="bg-surface rounded-md p-4">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Reasoning Trace</h4>
            <p className="text-sm text-foreground leading-relaxed">{t.ai_explanation}</p>
          </div>

          {/* Flags */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detection Flags</h4>
            <div className="space-y-2">
              {t.flags.map((f, i) => (
                <div key={i} className="flex items-start gap-2 bg-surface rounded-md px-3 py-2">
                  <ShieldAlert size={14} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground">{f.category}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">+{f.weight} risk</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Auditor Actions</h4>
            <div className="flex gap-2">
              <button onClick={() => { updateStatus(t.id, 'Investigating'); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-warning text-warning-foreground text-xs font-semibold">
                <SearchIcon size={12} /> Investigate
              </button>
              <button onClick={() => { updateStatus(t.id, 'Cleared'); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-success text-success-foreground text-xs font-semibold">
                <CheckCircle size={12} /> Clear
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold">
              <FileText size={12} /> Mark as Fraud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
