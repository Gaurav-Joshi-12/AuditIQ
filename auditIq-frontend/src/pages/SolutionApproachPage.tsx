import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Zap, Search, Activity, Network, FileText, Server } from 'lucide-react';

const AGENTS = [
  {
    id: 'kafka',
    title: 'Kafka Streaming',
    icon: <Server className="w-5 h-5 text-yellow-500" />,
    description: 'High-throughput ingestion pub/sub queue handling high-volume ledger data streams ensuring robust scale.',
  },
  {
    id: 'parser',
    title: 'Parser Agent',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    description: 'Ingests Excel binary, normalizes column headers, validates structure, outputs clean JSON for downstream agents.',
  },
  {
    id: 'anomaly',
    title: 'Anomaly Agent',
    icon: <Search className="w-5 h-5 text-white/90" />,
    description: 'On-prem LLM scoring engine generating risk tier, anomaly classification, confidence, and remediation insights per transaction.',
  },
  {
    id: 'pattern',
    title: 'Pattern Agent',
    icon: <Activity className="w-5 h-5 text-red-500" />,
    description: 'Groups by vendor → concentration risk (3+ flags), detects spike dates, round numbers (amount%1000=0), weekend postings.',
  },
  {
    id: 'report',
    title: 'Report Agent',
    icon: <FileText className="w-5 h-5 text-white/90" />,
    description: 'Filters all flagged rows, computes summary stats, writes to Google Sheets — Flagged_Transactions + Summary_Stats.',
  }
];

const BULLETS = [
  {
    title: 'Smart Data Intake, Kafka & AI Processing',
    desc: 'Seamlessly convert raw financial datasets into structured, analyzable audit data using high-volume Kafka event streams.'
  },
  {
    title: 'Risk Intelligence Dashboard',
    desc: 'Transform complex audit data into clear, actionable insights.'
  },
  {
    title: 'Automated Investigation & Reporting',
    desc: 'Enable efficient anomaly investigation and generate audit-ready documentation.'
  },
  {
    title: 'AI Audit Copilot & Continuous Monitoring',
    desc: 'Auditors can instantly retrieve insights using an AI-powered query interface and export reports.'
  }
];

const SolutionApproachPage = () => {
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
              Deloitte AuditIQ Solution
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:p-12 pb-32 flex flex-col items-center">
        
        <div className="w-full max-w-[1400px]">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary">
              Solution approach
            </h2>
          </div>

          <div className="mb-10 max-w-5xl">
            <p className="text-lg md:text-xl leading-relaxed text-white/90 mb-6">
              To address the audit analytics challenge, we propose <span className="font-bold border-b border-primary/50 text-white">AuditIQ</span> — reduces manual audit effort by automatically analyzing thousands of transactions and generating audit-ready reports in under a minute.
            </p>

            <ul className="space-y-3 mb-8 ml-4">
              {BULLETS.map((bullet, i) => (
                <li key={i} className="flex text-base md:text-lg leading-snug">
                  <span className="mr-3 mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-white/90">
                    <span className="text-primary font-semibold">{bullet.title}</span> — {bullet.desc}
                  </p>
                </li>
              ))}
            </ul>

            <p className="text-lg md:text-xl leading-relaxed text-white/90">
              All AI processing runs securely within Deloitte's GenW platform, ensuring sensitive financial data remains protected.
            </p>
          </div>

          {/* Grid Layout spanning 5 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {AGENTS.map((agent, index) => (
              <div 
                key={agent.id}
                className="flex flex-col relative justify-start items-start rounded-3xl border-2 border-primary/20 bg-[#2b6a12] p-8 shadow-[0_10px_30px_-10px_rgba(134,188,37,0.2)]"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {agent.icon}
                  <h3 className="text-white font-bold text-lg leading-tight">{agent.title}</h3>
                </div>
                
                <p className="text-white/90 text-[15px] leading-relaxed opacity-95 text-pretty flex-1">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SolutionApproachPage;
