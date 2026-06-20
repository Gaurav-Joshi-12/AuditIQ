import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Bot, LayoutDashboard, BrainCircuit, BoxSelect
} from 'lucide-react';

const MODULES = [
  {
    id: 'app-maker',
    title: 'GenW App Maker',
    icon: <BoxSelect className="w-5 h-5 text-white" />,
    headerDesc: 'Data Ingestion & Auditor Interface:',
    headerText: 'Upload financial ledgers and start the audit pipeline.',
    points: [
      'Drag-and-drop Excel / CSV upload',
      'Real-time processing status',
      'Automated file validation & error detection',
      'Generates dashboard once processing completes'
    ],
    footerText: 'No technical expertise required - auditors operate the system directly.',
    bgColor: '#73A922'
  },
  {
    id: 'agent-builder',
    title: 'GenW Agent Builder',
    icon: <Bot className="w-5 h-5 text-white" />,
    headerDesc: 'AI Anomaly Detection Pipeline:',
    headerText: 'Multi-agent workflow that analyzes transactions.',
    points: [
      'Parser Agent - cleans and standardizes ledger data',
      'Anomaly Agent - flags suspicious transactions using LLM inference',
      'Pattern Agent - detects vendor concentration and timing anomalies',
      'Report Agent - generates enriched audit-ready outputs'
    ],
    footerText: 'AI analyzes every transaction automatically.',
    bgColor: '#679B1C'
  },
  {
    id: 'playground',
    title: 'GenW Playground',
    icon: <LayoutDashboard className="w-5 h-5 text-white" />,
    headerDesc: 'Interactive Audit Analytics Dashboard:',
    headerText: 'Real-time visualization of audit insights.',
    points: [
      'Risk distribution (Critical / Moderate)',
      'Transaction timeline with anomaly spikes',
      'Vendor risk ranking',
      'Department-wise anomaly breakdown',
      'Filterable flagged transaction table'
    ],
    footerText: 'Auditors explore risk patterns without writing SQL.',
    bgColor: '#2E7C1F'
  },
  {
    id: 'realmai',
    title: 'GenW RealmAI',
    icon: <BrainCircuit className="w-5 h-5 text-white" />,
    headerDesc: 'Natural Language Audit Intelligence:',
    headerText: 'Conversational interface for audit analysis.',
    points: [
      'Converts natural language questions into dataset queries',
      'Retrieves relevant flagged transactions instantly',
      'Provides explainable insights with traceable data references',
      'Maintains an auditable query trail for documentation'
    ],
    footerText: 'Makes financial analysis accessible to non-technical auditors.',
    bgColor: '#215E16'
  }
];

const ModulesPage = () => {
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
              Deloitte AuditIQ Modules
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:p-12 pb-32 flex flex-col items-center bg-[#000000]">
        
        <div className="w-full max-w-[1400px]">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary">
              GenW.AI Modules Deep Dive
            </h2>
          </div>

          {/* Grid Layout spanning 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {MODULES.map((mod, index) => (
              <div 
                key={mod.id}
                className="flex flex-col relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                {/* Top Pill Icon Header */}
                <div 
                  className="mx-auto mb-4 flex items-center gap-2 px-6 py-2.5 rounded-full shadow-lg relative z-10"
                  style={{ backgroundColor: mod.bgColor, boxShadow: `0 10px 15px -3px ${mod.bgColor}40` }}
                >
                  {mod.icon}
                  <h3 className="text-white font-bold text-lg whitespace-nowrap">{mod.title}</h3>
                </div>

                {/* Main Card Body */}
                <div 
                  className="flex-1 rounded-[2rem] border-4 border-white p-6 md:p-8 flex flex-col text-white shadow-2xl relative"
                  style={{ backgroundColor: mod.bgColor }}
                >
                  {/* Subtle Top Inner Glow to match rounded card style */}
                  <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent rounded-t-[1.8rem] pointer-events-none" />
                  
                  {/* Header text inside card */}
                  <div className="mb-6 z-10">
                    <p className="text-sm md:text-base leading-relaxed">
                      <span className="font-bold">{mod.headerDesc}</span>{' '}
                      <span className="opacity-90">{mod.headerText}</span>
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <ul className="space-y-3 mb-8 z-10 flex-1">
                    {mod.points.map((point, i) => (
                      <li key={i} className="flex items-start text-sm leading-snug opacity-95">
                        <span className="mr-2 mt-[6px] w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  {/* Footer Text */}
                  <div className="text-center z-10 mt-auto pt-4 border-t border-white/20">
                    <p className="text-sm opacity-90 leading-tight font-medium">
                      {mod.footerText}
                    </p>
                  </div>
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

export default ModulesPage;
