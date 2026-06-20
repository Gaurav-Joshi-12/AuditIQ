import { useState, useMemo } from 'react';
import { useAuditStore } from '@/store/audit-store';
import { ShieldAlert, Info, AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { TransactionDetail } from './TransactionDetail';

const ITEMS_PER_PAGE = 15;

const RiskBadge = ({ tier }: { tier: string }) => {
  const config = {
    Critical: { icon: ShieldAlert, className: 'bg-destructive-light text-destructive' },
    Moderate: { icon: AlertTriangle, className: 'bg-warning-light text-warning-foreground' },
    Low: { icon: Info, className: 'bg-muted text-muted-foreground' },
  }[tier] || { icon: Info, className: 'bg-muted text-muted-foreground' };
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${config.className}`}>
      <Icon size={11} />
      {tier}
    </span>
  );
};

export const ExceptionTable = () => {
  const flagged = useAuditStore(s => s.flaggedTransactions);
  const updateStatus = useAuditStore(s => s.updateFlaggedStatus);
  const [page, setPage] = useState(1);
  const [filterTier, setFilterTier] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...flagged];
    if (filterTier !== 'All') data = data.filter(f => f.risk_tier === filterTier);
    return data.sort((a, b) => b.risk_score - a.risk_score);
  }, [flagged, filterTier]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const selectedTxn = selectedId ? flagged.find(f => f.id === selectedId) : null;

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Flagged Exceptions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} exceptions found</p>
        </div>
        <div className="flex gap-1">
          {['All', 'Critical', 'Moderate', 'Low'].map(tier => (
            <button
              key={tier}
              onClick={() => { setFilterTier(tier); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium animate-professional ${
                filterTier === tier ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface">
            <tr>
              {['Transaction ID', 'Vendor', 'Amount', 'Category', 'Risk', 'Score', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map(row => (
              <tr key={row.id} className="hover:bg-surface animate-professional">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{row.transaction_id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{row.vendor_name}</td>
                <td className="px-4 py-3 text-sm font-mono text-foreground tabular-nums text-right">₹{row.amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.fraud_category}</td>
                <td className="px-4 py-3"><RiskBadge tier={row.risk_tier} /></td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-foreground">{row.risk_score}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    onChange={(e) => updateStatus(row.id, e.target.value as any)}
                    className="text-xs bg-surface border border-border rounded-md px-2 py-1 text-foreground"
                  >
                    <option>Pending</option>
                    <option>Investigating</option>
                    <option>Cleared</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedId(row.id)} className="p-1 rounded-md hover:bg-accent text-muted-foreground">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {selectedTxn && (
        <TransactionDetail transaction={selectedTxn} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
};
