import { useState, useMemo } from 'react';
import { useAuditStore } from '@/store/audit-store';
import { Search, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const ITEMS_PER_PAGE = 20;
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DataExplorer = () => {
  const transactions = useAuditStore(s => s.transactions);
  const globalSearchQuery = useAuditStore(s => s.searchQuery);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() =>
    transactions.filter(t =>
      (t.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
       t.vendor_name.toLowerCase().includes(search.toLowerCase())) &&
      (globalSearchQuery === '' || 
       t.transaction_id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
       t.vendor_name.toLowerCase().includes(globalSearchQuery.toLowerCase()))
    ), [transactions, search, globalSearchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Quick insights
  const totalValue = filtered.reduce((s, t) => s + t.amount, 0);
  const uniqueVendors = new Set(filtered.map(t => t.vendor_name)).size;
  const avgSize = filtered.length > 0 ? totalValue / filtered.length : 0;

  // Charts data
  const volumeByMonth = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(t => {
      const m = t.date.slice(0, 7);
      map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const vendorDist = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(t => map.set(t.vendor_name, (map.get(t.vendor_name) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(t => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20">
        <Database size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No Data Available</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {useAuditStore.getState().userRole === 'organization'
            ? 'Please select a completed audit report from your Reports & Insights page to explore the dataset.'
            : 'Navigate to Data Ingestion to select and process a client\'s financial data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Uploaded Data Explorer</h2>
        <p className="text-sm text-muted-foreground mt-1">Inspect and visualize your raw transaction dataset</p>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Rows', value: transactions.length.toLocaleString() },
          { label: 'Total Value', value: `₹${(totalValue / 10000000).toFixed(1)}Cr` },
          { label: 'Unique Vendors', value: uniqueVendors.toString() },
          { label: 'Avg Transaction', value: `₹${avgSize.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
        ].map(item => (
          <div key={item.label} className="bg-card rounded-lg border border-border shadow-card px-4 py-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border shadow-card p-5 col-span-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Transaction Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0} paddingAngle={2}>
                {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Top Vendors by Transaction Count</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={vendorDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12 }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Grid */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Transaction Data</h3>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID or vendor..."
              className="h-8 w-56 rounded-md border border-border bg-surface pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface">
              <tr>
                {['ID', 'Vendor', 'Date', 'Amount', 'Ledger', 'Category', 'Bal Before', 'Bal After'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(t => (
                <tr key={t.id} className="hover:bg-surface animate-professional">
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{t.transaction_id}</td>
                  <td className="px-4 py-2 text-sm text-foreground">{t.vendor_name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground font-mono">{t.date}</td>
                  <td className="px-4 py-2 text-sm font-mono text-foreground tabular-nums text-right">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{t.ledger_type}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-2 text-xs font-mono text-muted-foreground text-right">₹{t.balance_before.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2 text-xs font-mono text-muted-foreground text-right">₹{t.balance_after.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30"><ChevronLeft size={14} /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
