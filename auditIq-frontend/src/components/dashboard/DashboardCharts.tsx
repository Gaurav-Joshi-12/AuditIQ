import { useAuditStore } from '@/store/audit-store';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';
import { useMemo } from 'react';

const RISK_COLORS = { Critical: '#ef4444', Moderate: '#f59e0b', Low: '#94a3b8' };
const CHART_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4'];

const ChartCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-lg border border-border shadow-card p-5 ${className}`}>
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

export const FraudPieChart = () => {
  const { transactions, flaggedTransactions } = useAuditStore();
  const data = useMemo(() => [
    { name: 'Normal', value: transactions.length - flaggedTransactions.length },
    { name: 'Flagged', value: flaggedTransactions.length },
  ], [transactions, flaggedTransactions]);

  return (
    <ChartCard title="Fraud vs Normal Transactions">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
            <Cell fill="#3b82f6" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(214,20%,91%)', fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const AnomalyCategoryChart = () => {
  const flagged = useAuditStore(s => s.flaggedTransactions);
  const data = useMemo(() => {
    const map = new Map<string, number>();
    flagged.forEach(f => f.flags.forEach(fl => map.set(fl.category, (map.get(fl.category) || 0) + 1)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [flagged]);

  return (
    <ChartCard title="Anomaly Category Breakdown">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,91%)" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
          <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(214,20%,91%)', fontSize: 12 }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const TransactionTrendChart = () => {
  const { transactions, flaggedTransactions } = useAuditStore();
  const data = useMemo(() => {
    const map = new Map<string, { date: string; total: number; flagged: number }>();
    transactions.forEach(t => {
      const d = t.date.slice(0, 7);
      const entry = map.get(d) || { date: d, total: 0, flagged: 0 };
      entry.total++;
      map.set(d, entry);
    });
    flaggedTransactions.forEach(f => {
      const d = f.date.slice(0, 7);
      const entry = map.get(d);
      if (entry) entry.flagged++;
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, flaggedTransactions]);

  return (
    <ChartCard title="Transaction Volume Trend" className="col-span-2">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,91%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(214,20%,91%)', fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total" />
          <Line type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} dot={false} name="Flagged" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const RiskDistributionChart = () => {
  const flagged = useAuditStore(s => s.flaggedTransactions);
  const data = useMemo(() => {
    const tiers = { Critical: 0, Moderate: 0, Low: 0 };
    flagged.forEach(f => tiers[f.risk_tier]++);
    return Object.entries(tiers).map(([name, value]) => ({ name, value }));
  }, [flagged]);

  return (
    <ChartCard title="Risk Distribution">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name as keyof typeof RISK_COLORS]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(214,20%,91%)', fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const VendorRiskTable = () => {
  const vendors = useAuditStore(s => s.vendors);
  const sorted = useMemo(() => [...vendors].sort((a, b) => b.vendor_risk_score - a.vendor_risk_score).slice(0, 10), [vendors]);

  return (
    <ChartCard title="Top Risk Vendors" className="col-span-2">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface">
            <tr>
              {['Vendor', 'Transactions', 'Total Amount', 'Fraud Flags', 'Risk Score'].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map(v => (
              <tr key={v.vendor_id} className="hover:bg-surface animate-professional">
                <td className="px-4 py-2.5 text-sm font-medium text-foreground">{v.vendor_name}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-muted-foreground">{v.total_transactions}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-foreground">₹{v.total_amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-destructive font-semibold">{v.fraud_count}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${v.vendor_risk_score}%`,
                          backgroundColor: v.vendor_risk_score > 70 ? '#ef4444' : v.vendor_risk_score > 30 ? '#f59e0b' : '#94a3b8'
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">{v.vendor_risk_score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
};
