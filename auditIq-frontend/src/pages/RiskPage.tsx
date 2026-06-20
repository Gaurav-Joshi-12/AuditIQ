import { useAuditStore } from '@/store/audit-store';
import { RiskDistributionChart, AnomalyCategoryChart } from '@/components/dashboard/DashboardCharts';
import { Shield } from 'lucide-react';

const RiskPage = () => {
  const hasData = useAuditStore(s => s.hasData);

  if (!hasData) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No Risk Data</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload data to view risk analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Risk Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">Deep dive into anomaly patterns and risk distribution</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistributionChart />
        <AnomalyCategoryChart />
      </div>
    </div>
  );
};

export default RiskPage;
