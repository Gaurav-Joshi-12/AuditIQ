import { useAuditStore } from '@/store/audit-store';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  FraudPieChart, AnomalyCategoryChart, TransactionTrendChart,
  RiskDistributionChart, VendorRiskTable
} from '@/components/dashboard/DashboardCharts';
import { AuditPipeline } from '@/components/pipeline/AuditPipeline';
import { BarChart3, AlertTriangle, Activity, Shield, DollarSign, Users, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { metrics, hasData, pipelineStage, activeSubmissionId, submissions, userRole } = useAuditStore();
  const navigate = useNavigate();

  const activeSub = submissions.find(s => s.id === activeSubmissionId);

  if (!hasData && pipelineStage === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Inbox size={56} className="text-primary/20 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">No Report Selected</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6 text-center max-w-md">
          {userRole === 'organization'
            ? 'Please select a completed audit report from your Reports & Insights page to view the Analytics Dashboard.'
            : 'Navigate to Data Ingestion to select and process a client\'s financial data, or view a completed audit report.'}
        </p>
        <button onClick={() => navigate(userRole === 'organization' ? '/org/reports' : '/auditor/ingestion')}
          className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          {userRole === 'organization' ? 'Go to Reports' : 'Go to Data Ingestion'}
        </button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <AuditPipeline />
        <div className="text-center py-12 text-muted-foreground text-sm">Processing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Analytics Dashboard {userRole === 'auditor' && activeSub ? `· ${activeSub.orgName}` : ''}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            AuditIQ identified {metrics!.flagged_count} critical exceptions across {metrics!.total_transactions.toLocaleString()} transactions.
          </p>
        </div>
      </div>

      <AuditPipeline />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Transactions" value={metrics!.total_transactions.toLocaleString()} icon={<BarChart3 size={16} />} color="primary" trend="neutral" trendValue="current" />
        <KPICard label="Flagged Exceptions" value={metrics!.flagged_count.toString()} icon={<AlertTriangle size={16} />} color="destructive" trend="up" trendValue={`${((metrics!.flagged_count / metrics!.total_transactions) * 100).toFixed(1)}%`} />
        <KPICard label="Avg Risk Score" value={`${metrics!.avg_risk_score}/100`} icon={<Activity size={16} />} color="warning" />
        <KPICard label="High Risk Vendors" value={metrics!.high_risk_vendors.toString()} icon={<Users size={16} />} color="destructive" />
        <KPICard label="Total Value" value={`₹${(metrics!.total_value / 10000000).toFixed(1)}Cr`} icon={<DollarSign size={16} />} color="primary" />
        <KPICard label="Fraud Amount" value={`₹${(metrics!.total_fraud_amount / 100000).toFixed(1)}L`} icon={<Shield size={16} />} color="destructive" trend="up" trendValue="flagged" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TransactionTrendChart />
        <RiskDistributionChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FraudPieChart />
        <AnomalyCategoryChart />
      </div>
      <VendorRiskTable />
    </div>
  );
};

export default DashboardPage;
