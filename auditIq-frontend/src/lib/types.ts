export interface Transaction {
  id: string;
  transaction_id: string;
  vendor_id: string;
  vendor_name: string;
  date: string;
  amount: number;
  ledger_type: string;
  category: string;
  balance_before: number;
  balance_after: number;
}

export interface FlaggedTransaction extends Transaction {
  fraud_category: string;
  risk_score: number;
  risk_tier: 'Critical' | 'Moderate' | 'Low';
  ai_explanation: string;
  confidence_score: number;
  status: 'Pending' | 'Cleared' | 'Investigating';
  flags: AuditFlag[];
}

export interface AuditFlag {
  category: string;
  weight: number;
  note: string;
}

export interface Vendor {
  vendor_name: string;
  vendor_id: string;
  total_transactions: number;
  total_amount: number;
  fraud_count: number;
  vendor_risk_score: number;
}

export interface SummaryMetrics {
  total_transactions: number;
  total_value: number;
  flagged_count: number;
  avg_risk_score: number;
  high_risk_vendors: number;
  total_fraud_amount: number;
}

export type PipelineStage = 'idle' | 'ingest' | 'clean' | 'anomaly' | 'pattern' | 'validate' | 'report' | 'complete';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Dual-Portal Types ───────────────────────────────────────

export interface Organization {
  id: string;           // string version of backendId for frontend keys
  backendId: number;    // real DB primary key for API calls
  name: string;
  industry: string;
  contactEmail: string;
  gstNumber: string;
  logoColor: string;
}

export type SubmissionStatus = 'pending' | 'processing' | 'completed';

export interface Submission {
  id: string;
  orgId: string;
  orgName: string;
  fileName: string;
  uploadId?: number; // Added for Backend ID mapping
  uploadedAt: string; // ISO date string
  status: SubmissionStatus;
  rowCount: number;
  transactions: Transaction[];
  flaggedTransactions?: FlaggedTransaction[];
  vendors?: Vendor[];
  metrics?: SummaryMetrics;
  emailSent?: boolean; // Org can only see report after auditor emails it
}

export type UserRole = 'organization' | 'auditor' | 'simulation' | 'none';
