import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import type {
  Transaction, FlaggedTransaction, Vendor, SummaryMetrics,
  PipelineStage, ChatMessage, Organization, Submission, UserRole,
} from '@/lib/types';
import { computeVendors } from '@/lib/audit-engine';

const API = 'http://localhost:8082';

// ─── Backend → Frontend Type Mappers ──────────────────────────────────────────

function mapAnomalyToFlagged(a: any): FlaggedTransaction {
  return {
    id: String(a.anomalyId),
    transaction_id: a.transactionId ?? '',
    vendor_id: a.vendorId ?? '',
    vendor_name: a.vendorName ?? '',
    date: a.transactionDate ?? '',
    amount: Number(a.amount ?? 0),
    ledger_type: a.ledgerType ?? '',
    category: a.category ?? '',
    balance_before: Number(a.balanceBefore ?? 0),
    balance_after: Number(a.balanceAfter ?? 0),
    fraud_category: (a.flags ?? []).join(', '),
    risk_score: Math.min((a.severityScore ?? 0) * 12, 100),
    risk_tier:
      a.severity === 'CRITICAL' || a.severity === 'HIGH'
        ? 'Critical'
        : a.severity === 'MEDIUM'
        ? 'Moderate'
        : 'Low',
    ai_explanation: a.explanation ?? '',
    status: 'Pending',
    flags: (a.flags ?? []).map((f: string) => ({
      category: f,
      weight: a.severityScore ?? 0,
      note: 'Detected by AI heuristic rules.',
    })),
    confidence_score: 95,
  };
}

function mapTransaction(t: any): Transaction {
  return {
    id: String(t.id),
    transaction_id: t.transactionId ?? '',
    vendor_id: t.vendorId ?? '',
    vendor_name: t.vendorName ?? '',
    date: t.transactionDate ?? '',
    amount: Number(t.amount ?? 0),
    ledger_type: t.ledgerType ?? '',
    category: t.category ?? '',
    balance_before: Number(t.balanceBefore ?? 0),
    balance_after: Number(t.balanceAfter ?? 0),
  };
}

function mapCompanyToOrg(c: any): Organization {
  const colors = ['#1a73e8', '#e53935', '#0288d1', '#f9a825', '#43a047', '#7b1fa2', '#00838f'];
  return {
    id: String(c.id),
    backendId: c.id as number,
    name: c.name ?? 'Unknown',
    industry: c.industry ?? '',
    contactEmail: `audit@${(c.name ?? 'company').toLowerCase().replace(/[\s.]+/g, '')}.com`,
    gstNumber: c.gstNumber ?? '',
    logoColor: colors[c.id % colors.length],
  };
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

interface AuditState {
  token: string | null;
  userRole: UserRole;
  currentOrgId: string | null;
  organizations: Organization[];
  submissions: Submission[];
  activeSubmissionId: string | null;

  // Analysis results — persisted across navigation
  transactions: Transaction[];
  flaggedTransactions: FlaggedTransaction[];
  vendors: Vendor[];
  metrics: SummaryMetrics | null;
  pipelineStage: PipelineStage;
  chatMessages: ChatMessage[];
  isProcessing: boolean;
  hasData: boolean;
  searchQuery: string;
  isLoadingData: boolean;

  // Actions
  setToken: (token: string | null) => void;
  setRole: (role: UserRole) => void;
  setCurrentOrg: (orgId: string | null) => void;
  logout: () => void;
  loadFromBackend: () => Promise<void>;

  submitOrgData: (orgId: string, file: File) => Promise<void>;
  processSubmission: (submissionId: string) => Promise<void>;
  loadSubmissionResults: (submissionId: string) => Promise<void>;
  emailReport: (submissionId: string, pdfBlob?: Blob) => Promise<void>;

  setTransactions: (txns: Transaction[]) => void;
  setPipelineStage: (stage: PipelineStage) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateFlaggedStatus: (id: string, status: 'Pending' | 'Cleared' | 'Investigating') => void;
  setSearchQuery: (query: string) => void;
  
  // RAG routing state
  activeUploadIdForRag: number | null;
  activeCompanyIdForRag: number | null;
  startRAGSession: (companyId: number, uploadId?: number) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      token: null,
      userRole: 'none',
      currentOrgId: null,
      organizations: [],
      submissions: [],
      activeSubmissionId: null,

      transactions: [],
      flaggedTransactions: [],
      vendors: [],
      metrics: null,
      pipelineStage: 'idle',
      chatMessages: [],
      isProcessing: false,
      hasData: false,
      searchQuery: '',
      isLoadingData: false,
      
      activeUploadIdForRag: null,
      activeCompanyIdForRag: null,

      setToken: (token) => set({ token }),
      setRole: (role) => set({ userRole: role }),
      setCurrentOrg: (orgId) => set({ currentOrgId: orgId }),
      startRAGSession: (companyId, uploadId) => set({ activeCompanyIdForRag: companyId, activeUploadIdForRag: uploadId || null }),
      logout: () => set({ token: null, userRole: 'none', currentOrgId: null }),

      // ── Fetch real companies + uploads from backend ────────────────────────
      loadFromBackend: async () => {
        set({ isLoadingData: true });
        try {
          const companiesRes = await api.get(`${API}/api/companies`);
          const companies: any[] = companiesRes.data;
          const orgs: Organization[] = companies.map(mapCompanyToOrg);

          const allSubmissions: Submission[] = [];
          const currentSubs = get().submissions;

          await Promise.all(
            orgs.map(async (org) => {
              try {
                const uploadsRes = await api.get(`${API}/api/uploads/company/${org.backendId}`);
                const uploads: any[] = uploadsRes.data;
                uploads.forEach(u => {
                  const existing = currentSubs.find(s => s.id === String(u.uploadId));
                  allSubmissions.push({
                    id: String(u.uploadId),
                    orgId: org.id,
                    orgName: org.name,
                    fileName: u.fileName ?? '',
                    uploadId: u.uploadId,
                    uploadedAt: u.uploadedAt ?? new Date().toISOString(),
                    // Force pending if not explicitly completed in frontend session so they see animation
                    status: existing?.status === 'completed' ? 'completed' : 'pending',
                    rowCount: u.totalRows ?? 0,
                    transactions: existing?.transactions || [],
                    flaggedTransactions: existing?.flaggedTransactions || [],
                    vendors: existing?.vendors || [],
                    metrics: existing?.metrics || null,
                    emailSent: u.sharedWithOrg === true,
                  });
                });
              } catch {
                // company may have no uploads yet — that's fine
              }
            })
          );

          set({ organizations: orgs, submissions: allSubmissions, isLoadingData: false });
        } catch (e) {
          console.error('Failed to load from backend', e);
          set({ isLoadingData: false });
        }
      },

      // ── Organization: upload file, run AI pipeline ─────────────────────────
      submitOrgData: async (orgId, file) => {
        const org = get().organizations.find(o => o.id === orgId);
        if (!org) throw new Error('Organization not found');

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post(
          `${API}/api/uploads/upload?companyId=${org.backendId}`,
          formData
        );

        const u = uploadRes.data;
        const newSub: Submission = {
          id: String(u.uploadId),
          orgId: org.id,
          orgName: org.name,
          fileName: u.fileName ?? '',
          uploadId: u.uploadId,
          uploadedAt: new Date().toISOString(),
          status: 'pending', // So auditor gets to run the pipeline animation
          rowCount: u.totalRows ?? 0,
          transactions: [],
          emailSent: false,
        };

        set(s => ({ submissions: [newSub, ...s.submissions] }));
      },

      // ── Auditor: animate pipeline, then fetch real results ─────────────────
      processSubmission: async (submissionId) => {
        if (get().isProcessing) return;

        const sub = get().submissions.find(s => s.id === submissionId);
        if (!sub || sub.status === 'completed') return;
        if (!sub.uploadId) { console.error('No uploadId'); return; }

        set(s => ({
          submissions: s.submissions.map(s2 =>
            s2.id === submissionId ? { ...s2, status: 'processing' as const } : s2
          ),
          activeSubmissionId: submissionId,
          transactions: [],
          flaggedTransactions: [],
          vendors: [],
          metrics: null,
          isProcessing: true,
          pipelineStage: 'ingest',
          hasData: false,
          chatMessages: [],
        }));

        // Cinematic pipeline animation (delays happen here, results fetch at report stage)
        await delay(900);  set({ pipelineStage: 'clean' });
        await delay(900);  set({ pipelineStage: 'anomaly' });
        await delay(1200); set({ pipelineStage: 'pattern' });
        await delay(1000); set({ pipelineStage: 'validate' });
        await delay(800);  set({ pipelineStage: 'report' });
        await delay(600);

        const companyId = get().organizations.find(o => o.id === sub.orgId)?.backendId || 1;

        try {
          const [txnsRes, anomaliesRes, summaryRes] = await Promise.all([
            api.get(`${API}/api/transactions/upload/${sub.uploadId}`),
            api.get(`${API}/api/anomalies/upload/${sub.uploadId}`),
            api.get(`${API}/api/anomalies/summary/${companyId}`),
          ]);

          const mappedTxns: Transaction[] = (txnsRes.data as any[]).map(mapTransaction);
          const mappedFlagged: FlaggedTransaction[] = (anomaliesRes.data as any[]).map(mapAnomalyToFlagged);
          const mappedVendors: Vendor[] = computeVendors(mappedTxns, mappedFlagged);
          const sumData: Record<string, number> = summaryRes.data;

          const totalValue = mappedTxns.reduce((s, t) => s + t.amount, 0);
          const totalFraud = mappedFlagged.reduce((s, f) => s + f.amount, 0);
          const avgRisk = mappedFlagged.length > 0
            ? mappedFlagged.reduce((s, f) => s + f.risk_score, 0) / mappedFlagged.length
            : 0;

          const mappedMetrics: SummaryMetrics = {
            total_transactions: mappedTxns.length,
            total_value: totalValue,
            flagged_count: mappedFlagged.length,
            avg_risk_score: Math.round(avgRisk),
            high_risk_vendors: (sumData['CRITICAL'] ?? 0) + (sumData['HIGH'] ?? 0),
            total_fraud_amount: totalFraud,
          };

          set(s => ({
            submissions: s.submissions.map(s2 =>
              s2.id === submissionId
                ? {
                    ...s2,
                    status: 'completed' as const,
                    rowCount: mappedTxns.length,
                    transactions: mappedTxns,
                    flaggedTransactions: mappedFlagged,
                    vendors: mappedVendors,
                    metrics: mappedMetrics,
                  }
                : s2
            ),
            transactions: mappedTxns,
            flaggedTransactions: mappedFlagged,
            vendors: mappedVendors,
            metrics: mappedMetrics,
            pipelineStage: 'complete',
            isProcessing: false,
            hasData: true,
          }));
        } catch (e: any) {
          console.error('Process failed:', e?.response?.data ?? e.message);
          set({ isProcessing: false, pipelineStage: 'idle' });
        }
      },

      loadSubmissionResults: async (submissionId) => {
        const sub = get().submissions.find(s => s.id === submissionId);
        if (!sub || sub.status !== 'completed') return;

        // If we already have it in the store, use it directly
        if (sub.transactions && sub.transactions.length > 0) {
          set({
            activeSubmissionId: submissionId,
            transactions: sub.transactions,
            flaggedTransactions: sub.flaggedTransactions ?? [],
            vendors: sub.vendors ?? [],
            metrics: sub.metrics ?? null,
            hasData: true,
            pipelineStage: 'complete',
            chatMessages: [],
          });
          return;
        }

        // If not, fetch it from backend (e.g. they clicked View Report on a newly loaded submission)
        const companyId = get().organizations.find(o => o.id === sub.orgId)?.backendId || 1;
        try {
          const [txnsRes, anomaliesRes, summaryRes] = await Promise.all([
            api.get(`${API}/api/transactions/upload/${sub.uploadId}`),
            api.get(`${API}/api/anomalies/upload/${sub.uploadId}`),
            api.get(`${API}/api/anomalies/summary/${companyId}`),
          ]);

          const mappedTxns: Transaction[] = (txnsRes.data as any[]).map(mapTransaction);
          const mappedFlagged: FlaggedTransaction[] = (anomaliesRes.data as any[]).map(mapAnomalyToFlagged);
          const mappedVendors: Vendor[] = computeVendors(mappedTxns, mappedFlagged);
          const sumData: Record<string, number> = summaryRes.data;

          const totalValue = mappedTxns.reduce((s, t) => s + t.amount, 0);
          const totalFraud = mappedFlagged.reduce((s, f) => s + f.amount, 0);
          const avgRisk = mappedFlagged.length > 0
            ? mappedFlagged.reduce((s, f) => s + f.risk_score, 0) / mappedFlagged.length
            : 0;

          const mappedMetrics: SummaryMetrics = {
            total_transactions: mappedTxns.length,
            total_value: totalValue,
            flagged_count: mappedFlagged.length,
            avg_risk_score: Math.round(avgRisk),
            high_risk_vendors: (sumData['CRITICAL'] ?? 0) + (sumData['HIGH'] ?? 0),
            total_fraud_amount: totalFraud,
          };

          set(s => ({
            submissions: s.submissions.map(s2 =>
              s2.id === submissionId
                ? {
                    ...s2,
                    transactions: mappedTxns,
                    flaggedTransactions: mappedFlagged,
                    vendors: mappedVendors,
                    metrics: mappedMetrics,
                  }
                : s2
            ),
            activeSubmissionId: submissionId,
            transactions: mappedTxns,
            flaggedTransactions: mappedFlagged,
            vendors: mappedVendors,
            metrics: mappedMetrics,
            hasData: true,
            pipelineStage: 'complete',
            chatMessages: [],
          }));
        } catch (e) {
          console.error("Failed to load results", e);
        }
      },

      // ── Email report: persisted to DB ──────────────────────────────────────
      emailReport: async (submissionId, pdfBlob?: Blob) => {
        const sub = get().submissions.find(s => s.id === submissionId);
        if (!sub?.uploadId) return;
        try {
          if (pdfBlob) {
            const formData = new FormData();
            formData.append('pdf', pdfBlob, 'AuditIQ_Report.pdf');
            await api.patch(`${API}/api/uploads/${sub.uploadId}/share`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            await api.patch(`${API}/api/uploads/${sub.uploadId}/share`);
          }
          set(s => ({
            submissions: s.submissions.map(s2 =>
              s2.id === submissionId ? { ...s2, emailSent: true } : s2
            ),
          }));
        } catch (e) {
          console.error('Failed to share report', e);
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setTransactions: (txns) => set({ transactions: txns }),
      setPipelineStage: (stage) => set({ pipelineStage: stage }),
      addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, msg] })),
      updateFlaggedStatus: (id, status) =>
        set(s => ({
          flaggedTransactions: s.flaggedTransactions.map(f =>
            f.id === id ? { ...f, status } : f
          ),
        })),
    }),
    {
      name: 'auditiq-v3',
      storage: createJSONStorage(() => sessionStorage), // session only — cleared on tab close
      partialize: (state) => ({
        // Persist analysis results so they survive navigation
        token: state.token,
        userRole: state.userRole,
        currentOrgId: state.currentOrgId,
        organizations: state.organizations,
        submissions: state.submissions,
        activeSubmissionId: state.activeSubmissionId,
        transactions: state.transactions,
        flaggedTransactions: state.flaggedTransactions,
        vendors: state.vendors,
        metrics: state.metrics,
        hasData: state.hasData,
        pipelineStage: state.pipelineStage === 'idle' ? 'idle' : state.pipelineStage,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
