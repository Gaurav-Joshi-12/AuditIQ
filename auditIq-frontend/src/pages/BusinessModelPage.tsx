import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Target, Trophy } from 'lucide-react';

const TARGET_MARKETS = [
  {
    title: 'Deloitte Audit & Assurance Teams',
    description: 'Primary deployment across all client engagements'
  },
  {
    title: 'Client CFOs & Internal Audit Heads',
    description: 'Direct users of the dashboard and NL querying interface'
  },
  {
    title: 'Big 4 Audit Firms Globally',
    description: 'Scalable across multiple geographies engagements'
  }
];

const VALUE_PROPOSITIONS = [
  {
    number: '01',
    title: 'Automated Audit Intelligence',
    description: 'AI detects anomalies with 100% consistency, eliminating manual errors and standardizing detection logic across every engagement and every auditor.'
  },
  {
    number: '02',
    title: 'Explainable Risk Flagging',
    description: 'Every flag comes with plain-English reasoning, confidence score, and recommended action — making every output immediately audit-ready and client-presentable without manual interpretation.'
  },
  {
    number: '03',
    title: 'Natural Language Audit Interface',
    description: 'Auditors query the flagged dataset in plain English via RealmAI. No SQL or filters needed. Every answer is cited with a full audit trail maintained.'
  }
];

const BusinessModelPage = () => {
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
              Deloitte AuditIQ Business Model
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:p-12 pb-32 flex flex-col items-center">
        
        <div className="w-full max-w-[1400px]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Left Column: Business Model (Target Market) - 4 cols wide */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start" style={{ animation: 'fadeInLeft 0.6s ease-out forwards' }}>
              <div className="mb-6 lg:mb-10 w-full flex justify-center lg:justify-start">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  Business Model
                </h2>
              </div>
              
              <div className="bg-[#78B430] p-6 md:p-8 rounded-[2rem] w-full max-w-sm lg:max-w-full shadow-[0_0_30px_rgba(120,180,48,0.2)]">
                <h3 className="text-white text-2xl font-bold text-center mb-6">Target Market</h3>
                
                <div className="space-y-4">
                  {TARGET_MARKETS.map((target, i) => (
                    <div key={i} className="bg-[#488719] rounded-3xl p-5 text-center shadow-md">
                      <h4 className="text-white font-bold text-lg leading-tight mb-1">{target.title}</h4>
                      <p className="text-white/90 text-sm leading-snug">{target.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Value Propositions - 8 cols wide */}
            <div className="lg:col-span-8 flex flex-col" style={{ animation: 'fadeInRight 0.6s ease-out forwards 0.2s', opacity: 0 }}>
              <div className="mb-6 lg:mb-10 w-full flex justify-center lg:justify-end">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#78B430] flex items-center gap-3">
                  Value Propositions
                  <Trophy className="w-8 h-8" />
                </h2>
              </div>

              <div className="flex flex-col gap-8 lg:gap-6 mt-4 md:pl-4">
                {VALUE_PROPOSITIONS.map((prop, i) => (
                  <div key={i} className="relative flex items-center justify-end w-full group mb-4">
                    
                    {/* The green chevron banner */}
                    <div className="w-[85%] bg-[#367914] py-6 px-12 relative z-10 
                      [clip-path:polygon(0%_0%,_90%_0%,_100%_50%,_90%_100%,_0%_100%,_10%_50%)]
                      transition-transform duration-300 group-hover:scale-[1.02]"
                    >
                      <h3 className="text-white font-bold text-xl mb-2 text-center drop-shadow-sm">{prop.title}</h3>
                      <p className="text-white/90 text-[15px] leading-relaxed text-center max-w-2xl mx-auto">
                        {prop.description}
                      </p>
                    </div>

                    {/* The circle number indicator */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 
                      w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#488719] border-4 border-[#000000] 
                      flex items-center justify-center shadow-2xl
                      transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#5aa420]"
                    >
                      <span className="text-white text-4xl md:text-5xl font-extrabold tracking-tighter">
                        {prop.number}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default BusinessModelPage;
