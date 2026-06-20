import { useAuditStore } from '@/store/audit-store';
import { VendorRiskTable } from '@/components/dashboard/DashboardCharts';
import { Users } from 'lucide-react';

const VendorPage = () => {
  const hasData = useAuditStore(s => s.hasData);

  if (!hasData) {
    return (
      <div className="text-center py-20">
        <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No Vendor Data</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload data to analyze vendor risk profiles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Vendor Insights</h2>
        <p className="text-sm text-muted-foreground mt-1">Vendor concentration risk analysis and scoring</p>
      </div>
      <VendorRiskTable />
    </div>
  );
};

export default VendorPage;
