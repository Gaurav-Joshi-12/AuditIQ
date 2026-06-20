import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bot, Search, MessageSquare, Lock, BarChart3, Rocket, CheckCircle2
} from 'lucide-react';

const DIFFERENTIATORS = [
  {
    id: 1,
    title: 'Multi-Agent Architecture',
    icon: <Bot className="w-6 h-6" />,
    subtitle: 'Parser → Anomaly → Pattern → Report',
    points: [
      'Modular AI pipeline',
      'Each agent has single responsibility',
      'Agents can scale independently'
    ],
    result: 'Highly scalable audit processing.',
    color: 'emerald'
  },
  {
    id: 2,
    title: 'Dual-Layer Anomaly Detection',
    icon: <Search className="w-6 h-6" />,
    subtitle: 'AI + Rule Engine',
    points: [
      'Layer 1: LLM anomaly scoring',
      'Layer 2: Hard rule validation',
      'Examples: Amount > ₹10L, Weekend postings'
    ],
    result: 'Zero blind spots in fraud detection.',
    color: 'emerald'
  },
  {
    id: 3,
    title: 'Explainable AI',
    icon: <MessageSquare className="w-6 h-6" />,
    subtitle: 'Every flagged transaction includes:',
    points: [
      'Anomaly type & confidence score',
      'Explanation in human language',
      'Recommended action',
      'Contributing factors'
    ],
    result: 'Immediately audit-ready insights.',
    color: 'emerald'
  },
  {
    id: 4,
    title: 'Zero Data Leakage',
    icon: <Lock className="w-6 h-6" />,
    subtitle: 'All AI inference runs inside Deloitte infrastructure',
    points: [
      'No external APIs',
      'No third-party data sharing',
      'Fully compliant with data governance policies'
    ],
    result: 'Enterprise-grade security.',
    color: 'emerald'
  },
  {
    id: 5,
    title: 'Natural Language Querying',
    icon: <BarChart3 className="w-6 h-6" />,
    subtitle: 'Auditors query datasets in plain English',
    points: [
      'Example: "Show critical transactions above ₹5L"',
      'Example: "Which vendor has the most anomalies?"',
      'Instant filtering across massive ledgers'
    ],
    result: 'No SQL or filtering required.',
    color: 'emerald'
  },
  {
    id: 6,
    title: 'POC Already Built',
    icon: <Rocket className="w-6 h-6" />,
    subtitle: 'Prototype implemented using:',
    points: [
      'n8n automated workflows',
      'Kafka streaming pipeline',
      'LLM anomaly detection models',
      'Validated using real financial datasets'
    ],
    result: 'Not just theory — working system.',
    color: 'emerald'
  }
];

const DifferentiatorsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-md hover:bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              Deloitte AuditIQ Differentiators
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-y-auto px-6 py-12 pb-32 flex flex-col items-center">
        
        <div className="max-w-6xl w-full">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              Key Differentiators
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Why AuditIQ is superior to traditional Audit tools
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((item, index) => (
              <div 
                key={item.id}
                className="group relative bg-[#0a0f0c] border border-primary/20 rounded-2xl p-6 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsla(86,65%,44%,0.3)] transition-all duration-500 overflow-hidden flex flex-col h-full"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xl font-bold text-foreground pr-4">{item.title}</h3>
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-300 text-primary">
                    {item.icon}
                  </div>
                </div>

                <div className="mb-5 relative z-10">
                  <p className="text-primary-light dark:text-primary font-semibold text-sm mb-3">
                    {item.subtitle}
                  </p>
                  <ul className="space-y-2">
                    {item.points.map((point, i) => (
                      <li key={i} className="flex items-start text-sm text-foreground/70 leading-snug">
                        <span className="mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacer to push Result to the bottom */}
                <div className="flex-1" />

                {/* Footer / Result */}
                <div className="pt-4 mt-2 border-t border-primary/20 relative z-10">
                  <p className="text-sm font-bold text-primary flex items-center gap-2">
                    <span className="uppercase tracking-wider text-[10px] bg-primary/20 px-2 py-0.5 rounded text-primary font-bold border border-primary/30">Result</span>
                    {item.result}
                  </p>
                </div>

                {/* Number Watermark */}
                <div className="absolute -bottom-6 -right-4 text-9xl font-black text-primary/[0.03] select-none pointer-events-none group-hover:text-primary/[0.05] transition-colors duration-500">
                  0{item.id}
                </div>
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

export default DifferentiatorsPage;
