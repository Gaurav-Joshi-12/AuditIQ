import * as XLSX from 'xlsx';
import type { Transaction, FlaggedTransaction, AuditFlag, Vendor, SummaryMetrics } from './types';

let idCounter = 0;
const genId = () => `txn-${++idCounter}-${Date.now()}`;

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const cleanData = (rawData: any[]): Transaction[] => {
  const seen = new Set<string>();
  return rawData
    .filter(row => {
      if (!row || Object.values(row).every(v => v == null || v === '')) return false;
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row, i) => {
      const amount = parseFloat(String(row.Amount || row.amount || 0).replace(/[₹,]/g, ''));
      const balBefore = parseFloat(String(row['Balance Before'] || row.balance_before || 0).replace(/[₹,]/g, ''));
      const balAfter = parseFloat(String(row['Balance After'] || row.balance_after || 0).replace(/[₹,]/g, ''));
      
      let dateStr = row.Date || row.date || row['Date/Time'] || new Date().toISOString();
      if (typeof dateStr === 'number') {
        const d = XLSX.SSF.parse_date_code(dateStr);
        dateStr = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
      }

      return {
        id: genId(),
        transaction_id: String(row['Transaction ID'] || row.transaction_id || `TXN-${String(i + 1).padStart(4, '0')}`),
        vendor_id: String(row['Vendor ID'] || row.vendor_id || `V${String(i % 50 + 1).padStart(3, '0')}`),
        vendor_name: String(row['Vendor'] || row.Vendor || row.vendor_name || `Vendor ${i % 50 + 1}`).trim(),
        date: String(dateStr),
        amount: isNaN(amount) ? 0 : amount,
        ledger_type: String(row['Ledger Type'] || row.ledger_type || 'General'),
        category: String(row['Category'] || row['Transaction Category'] || row.category || 'Uncategorized'),
        balance_before: isNaN(balBefore) ? 0 : balBefore,
        balance_after: isNaN(balAfter) ? 0 : balAfter,
      };
    });
};

export const detectAnomalies = (transactions: Transaction[]): FlaggedTransaction[] => {
  // Build maps for duplicate detection & vendor concentration
  const dupMap = new Map<string, Transaction[]>();
  const vendorMap = new Map<string, Transaction[]>();
  
  transactions.forEach(t => {
    const dupKey = `${t.vendor_name}-${t.amount}-${t.date.slice(0, 10)}`;
    dupMap.set(dupKey, [...(dupMap.get(dupKey) || []), t]);
    vendorMap.set(t.vendor_name, [...(vendorMap.get(t.vendor_name) || []), t]);
  });

  const avgAmount = transactions.reduce((s, t) => s + t.amount, 0) / transactions.length;
  const totalTxns = transactions.length;

  return transactions.map(t => {
    const flags: AuditFlag[] = [];

    // Duplicate detection
    const dupKey = `${t.vendor_name}-${t.amount}-${t.date.slice(0, 10)}`;
    if ((dupMap.get(dupKey)?.length || 0) > 1) {
      flags.push({ category: 'Duplicate Invoice', weight: 35, note: `Duplicate entry: same vendor, amount, and date detected.` });
    }

    // Round number
    if (t.amount > 0 && t.amount % 1000 === 0) {
      flags.push({ category: 'Round Number', weight: 15, note: `Transaction amount ₹${t.amount.toLocaleString('en-IN')} is an exact multiple of 1,000.` });
    }
    if (t.amount > 0 && t.amount % 100000 === 0) {
      flags.push({ category: 'Round Number', weight: 10, note: `Exact lakh-multiple amount detected.` });
    }

    // High value
    if (t.amount > 500000) {
      flags.push({ category: 'High Value', weight: 30, note: `Amount ₹${t.amount.toLocaleString('en-IN')} exceeds ₹5,00,000 threshold.` });
    }

    // Weekend posting
    const day = new Date(t.date).getDay();
    if (day === 0 || day === 6) {
      flags.push({ category: 'Weekend Posting', weight: 25, note: `Transaction posted on ${day === 0 ? 'Sunday' : 'Saturday'}.` });
    }

    // Vendor concentration
    const vendorTxns = vendorMap.get(t.vendor_name) || [];
    const vendorConcentration = vendorTxns.length / totalTxns;
    if (vendorConcentration > 0.1 && vendorTxns.length > 5) {
      flags.push({ category: 'Vendor Concentration', weight: 20, note: `${t.vendor_name} accounts for ${(vendorConcentration * 100).toFixed(1)}% of all transactions.` });
    }

    // Unusual amount vs average
    if (t.amount > avgAmount * 4) {
      flags.push({ category: 'Statistical Outlier', weight: 25, note: `Amount is ${(t.amount / avgAmount).toFixed(1)}x the average transaction value.` });
    }

    const riskScore = Math.min(flags.reduce((s, f) => s + f.weight, 0), 100);
    const riskTier = riskScore > 70 ? 'Critical' : riskScore > 30 ? 'Moderate' : 'Low';
    
    const explanations = flags.map(f => f.note).join(' ');
    const aiExplanation = flags.length > 0
      ? `This transaction was flagged because: ${explanations}`
      : '';

    return {
      ...t,
      fraud_category: flags.length > 0 ? flags[0].category : 'None',
      risk_score: riskScore,
      risk_tier: riskTier as 'Critical' | 'Moderate' | 'Low',
      ai_explanation: aiExplanation,
      confidence_score: Math.min(0.5 + flags.length * 0.12, 0.98),
      status: 'Pending' as const,
      flags,
    };
  }).filter(t => t.flags.length > 0);
};

export const computeVendors = (transactions: Transaction[], flagged: FlaggedTransaction[]): Vendor[] => {
  const map = new Map<string, { txns: Transaction[]; fraudCount: number }>();
  
  transactions.forEach(t => {
    const entry = map.get(t.vendor_name) || { txns: [], fraudCount: 0 };
    entry.txns.push(t);
    map.set(t.vendor_name, entry);
  });

  flagged.forEach(f => {
    const entry = map.get(f.vendor_name);
    if (entry) entry.fraudCount++;
  });

  return Array.from(map.entries()).map(([name, data]) => ({
    vendor_name: name,
    vendor_id: data.txns[0].vendor_id,
    total_transactions: data.txns.length,
    total_amount: data.txns.reduce((s, t) => s + t.amount, 0),
    fraud_count: data.fraudCount,
    vendor_risk_score: Math.min(Math.round((data.fraudCount / data.txns.length) * 100), 100),
  }));
};

export const computeMetrics = (transactions: Transaction[], flagged: FlaggedTransaction[], vendors: Vendor[]): SummaryMetrics => ({
  total_transactions: transactions.length,
  total_value: transactions.reduce((s, t) => s + t.amount, 0),
  flagged_count: flagged.length,
  avg_risk_score: flagged.length > 0 ? Math.round(flagged.reduce((s, f) => s + f.risk_score, 0) / flagged.length) : 0,
  high_risk_vendors: vendors.filter(v => v.vendor_risk_score > 50).length,
  total_fraud_amount: flagged.reduce((s, f) => s + f.amount, 0),
});
