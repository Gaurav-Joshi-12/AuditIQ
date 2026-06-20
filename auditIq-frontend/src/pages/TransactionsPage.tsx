import { ExceptionTable } from '@/components/exceptions/ExceptionTable';
import { useAuditStore } from '@/store/audit-store';
import { AlertTriangle } from 'lucide-react';

const TransactionsPage = () => {
  const hasData = useAuditStore(s => s.hasData);

  if (!hasData) {
    return (
      <div className="text-center py-20">
        <AlertTriangle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No Flagged Transactions</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload data to detect anomalies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Flagged Exceptions</h2>
        <p className="text-sm text-muted-foreground mt-1">Risk-tiered exception prioritization for auditor review</p>
      </div>
      <ExceptionTable />
    </div>
  );
};

export default TransactionsPage;
