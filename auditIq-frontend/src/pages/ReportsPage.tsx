import { useState } from 'react';
import { useAuditStore } from '@/store/audit-store';
import { FileText, Download, Printer, RefreshCw, Shield, AlertTriangle, CheckCircle, TrendingUp, Mail } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

const RISK_COLORS = { Critical: '#ef4444', Moderate: '#f59e0b', Low: '#94a3b8' };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

const StatBox = ({ label, value, sub, color = 'primary' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="bg-surface rounded-md px-4 py-3 border border-border">
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
    <p className={`text-xl font-bold font-mono mt-1 ${
      color === 'destructive' ? 'text-destructive' : color === 'warning' ? 'text-warning' : color === 'success' ? 'text-success' : 'text-foreground'
    }`}>{value}</p>
    {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
  </div>
);

const ReportsPage = () => {
  const { transactions, flaggedTransactions, vendors, metrics, hasData, activeSubmissionId, emailReport, organizations, submissions } = useAuditStore();
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);

  const reportData = useMemo(() => {
    if (!hasData || !metrics) return null;

    const criticalCount = flaggedTransactions.filter(f => f.risk_tier === 'Critical').length;
    const moderateCount = flaggedTransactions.filter(f => f.risk_tier === 'Moderate').length;
    const lowCount = flaggedTransactions.filter(f => f.risk_tier === 'Low').length;

    const categoryMap = new Map<string, number>();
    flaggedTransactions.forEach(f => f.flags.forEach(fl => categoryMap.set(fl.category, (categoryMap.get(fl.category) || 0) + 1)));
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const topVendors = [...vendors].sort((a, b) => b.vendor_risk_score - a.vendor_risk_score).slice(0, 5);
    const topFlagged = [...flaggedTransactions].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10);

    const riskDist = [
      { name: 'Critical', value: criticalCount },
      { name: 'Moderate', value: moderateCount },
      { name: 'Low', value: lowCount },
    ];

    const fraudRate = ((metrics.flagged_count / metrics.total_transactions) * 100).toFixed(2);
    const clearRate = ((flaggedTransactions.filter(f => f.status === 'Cleared').length / Math.max(flaggedTransactions.length, 1)) * 100).toFixed(1);

    // AI narrative generation
    const severity = criticalCount > 10 ? 'high' : criticalCount > 3 ? 'moderate' : 'low';
    const topCategory = categories[0]?.name || 'None';
    const topVendor = topVendors[0]?.vendor_name || 'N/A';

    return {
      criticalCount, moderateCount, lowCount, categories, topVendors, topFlagged,
      riskDist, fraudRate, clearRate, severity, topCategory, topVendor,
    };
  }, [hasData, metrics, flaggedTransactions, vendors, transactions]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerated(true);
    setGenerating(false);
  };

  const handlePrint = () => window.print();

  const handleSharePDF = async () => {
    if (!activeSubmissionId) return;
    
    setSharing(true);
    toast.info('Generating high-quality PDF report. Please wait...', { duration: 4000 });
    
    try {
      // 1. Target the report DOM element
      const reportElement = document.getElementById('audit-report-content');
      if (!reportElement) throw new Error('Report content not found');
      
      // 2. Capture canvas
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // 3. Initialize jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      // 4. Add image to first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      // 5. Loop and add subsequent pages
      while (heightLeft >= 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      // 6. Convert to Blob
      const pdfBlob = pdf.output('blob');
      
      // 6. Send via email
      await emailReport(activeSubmissionId, pdfBlob);
      
      const sub = submissions.find(s => s.id === activeSubmissionId);
      const org = organizations.find(o => o.id === sub?.orgId);
      
      toast.success(`PDF Report Shared with ${org?.contactEmail || 'Organization'}`, {
        description: `A beautifully formatted PDF report has been generated and emailed directly to ${org?.name || 'the client'}.`
      });
      
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate or share PDF report');
    } finally {
      setSharing(false);
    }
  };

  if (!hasData || !metrics || !reportData) {
    return (
      <div className="text-center py-20">
        <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Report Generation</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Load or upload audit data first to generate a comprehensive AI-powered audit report.
        </p>
      </div>
    );
  }

  if (!generated) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="bg-card rounded-lg border border-border shadow-card p-10">
          <Shield size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-xl font-bold text-foreground">Generate Audit Report</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            AuditIQ will synthesize all {metrics.total_transactions.toLocaleString()} transactions and {metrics.flagged_count} flagged exceptions into a structured executive report with AI-generated narratives.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatBox label="Transactions" value={metrics.total_transactions.toLocaleString()} />
            <StatBox label="Exceptions" value={metrics.flagged_count.toString()} color="destructive" />
            <StatBox label="Avg Risk" value={`${metrics.avg_risk_score}/100`} color="warning" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 animate-professional disabled:opacity-50 inline-flex items-center gap-2"
          >
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
            {generating ? 'Generating Report...' : 'Generate AI Audit Report'}
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const reportDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const reportId = `AQ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI-Generated Audit Report</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Report ID: {reportId} | Generated: {reportDate}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSharePDF} disabled={sharing} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 animate-professional inline-flex items-center gap-1.5 focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50">
            {sharing ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
            {sharing ? 'Generating PDF...' : 'Email PDF to Org'}
          </button>
          <button onClick={handlePrint} className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 focus:ring-2 focus:ring-ring focus:outline-none">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => setGenerated(false)} className="px-3 py-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground animate-professional inline-flex items-center gap-1.5 focus:ring-2 focus:ring-ring focus:outline-none">
            <RefreshCw size={14} /> Regenerate
          </button>
        </div>
      </div>

      {/* Report Body */}
      <div id="audit-report-content" className="bg-card rounded-lg border border-border shadow-card p-8 print:shadow-none print:border-none">
        {/* Title Block */}
        <div className="text-center border-b border-border pb-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={24} className="text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">AuditIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-2">Audit Exception Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Automated Anomaly Detection & Risk Assessment</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <span>Report: {reportId}</span>
            <span>Date: {reportDate}</span>
            <span>Classification: <strong className="text-foreground">Confidential</strong></span>
          </div>
        </div>

        {/* Executive Summary */}
        <Section title="1. Executive Summary">
          <div className="bg-surface rounded-md p-4 border border-border text-sm text-foreground leading-relaxed">
            <p>
              AuditIQ processed <strong>{metrics.total_transactions.toLocaleString()}</strong> financial transactions 
              with a total value of <strong>₹{(metrics.total_value / 10000000).toFixed(2)} Crore</strong>. 
              The AI-powered anomaly detection engine identified <strong>{metrics.flagged_count}</strong> exceptions 
              ({reportData.fraudRate}% anomaly rate), of which <strong className="text-destructive">{reportData.criticalCount}</strong> are 
              classified as Critical Risk requiring immediate investigation.
            </p>
            <p className="mt-3">
              The overall risk severity is assessed as <strong className={
                reportData.severity === 'high' ? 'text-destructive' : reportData.severity === 'moderate' ? 'text-warning' : 'text-success'
              }>{reportData.severity.toUpperCase()}</strong>. 
              The most prevalent anomaly type is <strong>{reportData.topCategory}</strong>, and the highest-risk vendor 
              is <strong>{reportData.topVendor}</strong>. The average risk score across flagged transactions 
              is <strong>{metrics.avg_risk_score}/100</strong>.
            </p>
            <p className="mt-3">
              {reportData.criticalCount > 5
                ? 'Immediate management attention is recommended due to the volume of critical-risk exceptions identified. A targeted deep-dive investigation into high-risk vendors and duplicate invoice patterns should be prioritized.'
                : 'The flagged exceptions are within manageable thresholds. Standard review procedures should be followed with priority given to Critical-tier items.'}
            </p>
          </div>
        </Section>

        {/* Key Metrics */}
        <Section title="2. Key Metrics Overview">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <StatBox label="Total Txns" value={metrics.total_transactions.toLocaleString()} />
            <StatBox label="Total Value" value={`₹${(metrics.total_value / 10000000).toFixed(1)}Cr`} />
            <StatBox label="Flagged" value={metrics.flagged_count.toString()} color="destructive" />
            <StatBox label="Critical" value={reportData.criticalCount.toString()} color="destructive" />
            <StatBox label="Avg Risk" value={`${metrics.avg_risk_score}`} color="warning" />
            <StatBox label="Risk Vendors" value={metrics.high_risk_vendors.toString()} color="warning" />
          </div>
        </Section>

        {/* Risk Distribution */}
        <Section title="3. Risk Distribution Analysis">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={reportData.riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0} paddingAngle={3}>
                    {reportData.riskDist.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name as keyof typeof RISK_COLORS]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex flex-col justify-center">
              {reportData.riskDist.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RISK_COLORS[d.name as keyof typeof RISK_COLORS] }} />
                  <span className="text-sm font-medium text-foreground flex-1">{d.name}</span>
                  <span className="text-sm font-mono font-bold text-foreground">{d.value}</span>
                  <span className="text-xs text-muted-foreground">({((d.value / metrics.flagged_count) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Anomaly Categories */}
        <Section title="4. Anomaly Category Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportData.categories} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,91%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-foreground leading-relaxed bg-surface rounded-md p-4 border border-border">
            <p>
              <strong>{reportData.categories[0]?.name}</strong> anomalies represent the largest category 
              with {reportData.categories[0]?.count} instances, followed 
              by <strong>{reportData.categories[1]?.name || 'N/A'}</strong> ({reportData.categories[1]?.count || 0} instances).
              {reportData.categories.find(c => c.name === 'Duplicate Invoice')
                ? ` Duplicate invoices suggest potential double-payment risk that should be cross-verified against vendor statements.`
                : ''}
              {reportData.categories.find(c => c.name === 'Weekend Posting')
                ? ` Weekend postings indicate after-hours activity that may circumvent standard authorization controls.`
                : ''}
            </p>
          </div>
        </Section>

        {/* Vendor Risk */}
        <Section title="5. High-Risk Vendor Analysis">
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface">
                <tr>
                  {['Rank', 'Vendor', 'Transactions', 'Fraud Flags', 'Risk Score'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportData.topVendors.map((v, i) => (
                  <tr key={v.vendor_id} className="hover:bg-surface">
                    <td className="px-4 py-2.5 text-sm font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{v.vendor_name}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-foreground">{v.total_transactions}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-destructive font-semibold">{v.fraud_count}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                        v.vendor_risk_score > 70 ? 'bg-destructive-light text-destructive' :
                        v.vendor_risk_score > 30 ? 'bg-warning-light text-warning-foreground' : 'bg-muted text-muted-foreground'
                      }`}>{v.vendor_risk_score}/100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Top Flagged Transactions */}
        <Section title="6. Critical Exceptions — Top 10">
          <div className="space-y-3">
            {reportData.topFlagged.map((t, i) => (
              <div key={t.id} className={`rounded-md border p-4 ${
                t.risk_tier === 'Critical' ? 'border-destructive/30 bg-destructive-light/50' :
                t.risk_tier === 'Moderate' ? 'border-warning/30 bg-warning-light/50' : 'border-border bg-surface'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">{t.transaction_id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.risk_tier === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                      t.risk_tier === 'Moderate' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {t.risk_tier} · {t.risk_score}/100
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-foreground">₹{t.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t.vendor_name} · {t.date} · {t.ledger_type}
                </div>
                <p className="text-xs text-foreground leading-relaxed mt-2 italic">{t.ai_explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Recommendations */}
        <Section title="7. AI-Generated Recommendations">
          <div className="space-y-3">
            {[
              {
                icon: AlertTriangle, color: 'text-destructive',
                title: 'Immediate Investigation Required',
                text: `${reportData.criticalCount} critical-risk transactions require urgent review. Prioritize vendor "${reportData.topVendor}" which shows the highest concentration of flagged entries.`,
              },
              {
                icon: Shield, color: 'text-warning',
                title: 'Strengthen Authorization Controls',
                text: reportData.categories.find(c => c.name === 'Weekend Posting')
                  ? `${reportData.categories.find(c => c.name === 'Weekend Posting')!.count} weekend postings were detected. Implement dual-authorization requirements for transactions processed outside business hours.`
                  : 'Review existing authorization protocols to prevent potential circumvention of approval thresholds.',
              },
              {
                icon: TrendingUp, color: 'text-primary',
                title: 'Vendor Relationship Review',
                text: `${metrics.high_risk_vendors} vendors show elevated risk scores. Conduct independent verification of vendor contracts and reconcile invoice histories against payment records.`,
              },
              {
                icon: CheckCircle, color: 'text-success',
                title: 'Enhance Detection Thresholds',
                text: `Current round-number detection threshold is set at ₹1,000 multiples. Consider adjusting based on industry-specific norms and historical transaction patterns to reduce false positives.`,
              },
            ].map((rec, i) => (
              <div key={i} className="flex gap-3 bg-surface rounded-md p-4 border border-border">
                <rec.icon size={18} className={`${rec.color} shrink-0 mt-0.5`} />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-border pt-6 mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            CONFIDENTIAL — INTERNAL USE ONLY
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Generated by AuditIQ · Deloitte Hacksplosion 2026 · GenWAI Audit Automation
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            This report was generated using automated AI analysis and should be reviewed by qualified auditors before formal submission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
