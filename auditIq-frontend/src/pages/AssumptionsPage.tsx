import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet, Bot, Fingerprint } from 'lucide-react';

const ASSUMPTIONS = [
  {
    id: 1,
    icon: <FileSpreadsheet className="w-6 h-6 text-white/80 shrink-0 mt-1" />,
    assumption: 'Source data is provided as structured Excel/.xlsx or CSV with standard financial columns, Transaction ID, Date, Amount, Department, Vendor, Posted By, Approved By',
    impact: 'If columns vary, Parser Agent normalization fails — breaking the downstream pipeline and producing incomplete audit output.',
    mitigation: 'Parser Agent uses column-name fuzzy matching plus a validation fallback that alerts the auditor immediately if structure is unrecognized.',
    bgColor: '#71b626', // Lightest green
  },
  {
    id: 2,
    icon: <Fingerprint className="w-6 h-6 text-white/80 shrink-0 mt-1" />,
    assumption: 'Auditors will trust and act on AI-flagged anomalies without manually re-verifying every flag raised by the system across each engagement.',
    impact: "If adoption is low due to distrust, the pipeline runs but flags are ignored — audit quality doesn't improve despite full automation.",
    mitigation: 'Every flag includes a confidence score, plain-English explanation, and recommended action building trust by augmenting auditor judgement, not replacing it.',
    bgColor: '#44841a', // Medium green
  },
  {
    id: 3,
    icon: <Bot className="w-6 h-6 text-white/80 shrink-0 mt-1" />,
    assumption: 'On-prem LLM via GenW Agent Builder produces consistent risk tier outputs across all transaction types and client datasets throughout each run.',
    impact: 'Inconsistent outputs lead to unstable risk rankings — the same transaction may be flagged differently across separate pipeline runs.',
    mitigation: 'Dual-layer architecture ensures the hard rule engine runs independently — weekend, round number, unapproved vendor, and >₹10L flags are always captured regardless of LLM variance.',
    bgColor: '#215c13', // Darkest green
  }
];

const AssumptionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-foreground font-sans selection:bg-primary/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              Deloitte AuditIQ Assumptions
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:p-12 pb-32 flex flex-col items-center">
        
        <div className="w-full max-w-[1400px]">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary">
              Assumptions
            </h2>
          </div>

          {/* Table Layout */}
          <div className="w-full border-2 border-white overflow-hidden rounded-xl shadow-2xl">
            
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-[#387a17] text-white font-bold text-lg md:text-xl border-b-2 border-white">
              <div className="p-6 md:p-8 text-center border-b-2 md:border-b-0 md:border-r-2 border-white flex items-center justify-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                Assumption
              </div>
              <div className="p-6 md:p-8 text-center border-b-2 md:border-b-0 md:border-r-2 border-white flex items-center justify-center gap-3">
                Impact
              </div>
              <div className="p-6 md:p-8 text-center flex items-center justify-center gap-3">
                <ShieldCheck className="w-6 h-6 text-white" />
                Mitigation
              </div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {ASSUMPTIONS.map((row) => (
                <div 
                  key={row.id} 
                  className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-white last:border-b-0"
                  style={{ backgroundColor: row.bgColor }}
                >
                  <div className="p-6 md:p-8 border-b-2 md:border-b-0 md:border-r-2 border-white/30 text-white font-medium flex gap-4">
                    {row.icon}
                    <p className="leading-relaxed text-sm md:text-base opacity-95 text-balance">
                      {row.assumption}
                    </p>
                  </div>
                  <div className="p-6 md:p-8 border-b-2 md:border-b-0 md:border-r-2 border-white/30 text-white flex items-start">
                    <p className="leading-relaxed text-sm md:text-base opacity-95">
                      {row.impact}
                    </p>
                  </div>
                  <div className="p-6 md:p-8 text-white flex items-start">
                    <p className="leading-relaxed text-sm md:text-base opacity-95">
                      {row.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
      
    </div>
  );
};

export default AssumptionsPage;
