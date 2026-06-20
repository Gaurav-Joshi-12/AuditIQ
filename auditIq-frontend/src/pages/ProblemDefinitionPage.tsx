import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertOctagon, Clock, SearchX, ActivitySquare } from 'lucide-react';

const CHALLENGES = [
  {
    id: 1,
    icon: <Clock className="w-8 h-8 text-primary group-hover:text-white transition-colors" />,
    title: 'Manual Data Review',
    description: 'Audit teams frequently analyze Excel files containing 10,000–100,000+ rows of transactions. Manually reviewing such datasets can take 3–5 days per engagement, significantly slowing down audit cycles and increasing operational costs.'
  },
  {
    id: 2,
    icon: <SearchX className="w-8 h-8 text-primary group-hover:text-white transition-colors" />,
    title: 'Lack of Automated Anomaly Detection',
    description: 'Traditional spreadsheet-based auditing lacks automated mechanisms to detect anomalies such as: Duplicate invoices, Unusual transaction amounts, Round-number entries, High-value weekend transactions. These patterns often remain hidden within large datasets, leading to missed critical exceptions.'
  },
  {
    id: 3,
    icon: <ActivitySquare className="w-8 h-8 text-primary group-hover:text-white transition-colors" />,
    title: 'Limited Pattern Recognition Across Vendors & Time',
    description: 'Manual review focuses on individual transactions, making it difficult to identify broader behavioral patterns, such as Sudden transaction spikes on specific dates and more which remain undetected.'
  }
];

const ProblemDefinitionPage = () => {
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
              Deloitte AuditIQ Context
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:px-12 w-full overflow-hidden">
        
        <div className="w-full max-w-[1200px] flex flex-col h-full justify-center">
          
          <div className="flex flex-col items-center text-center mb-6" style={{ animation: 'fadeInDown 0.6s ease-out forwards' }}>
            <div className="inline-flex items-center justify-center p-2.5 bg-primary/20 rounded-2xl mb-4">
              <AlertOctagon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Problem Definition
            </h2>
            <p className="text-base md:text-lg text-white/80 leading-snug max-w-5xl text-pretty px-4">
              Organizations today generate large volumes of financial data across General Ledgers (GL), Purchase Ledgers (PL), Sales Ledgers (SL), and vendor records. Auditors review this data to detect fraud, duplicate invoices, unusual transactions, and compliance violations, often working with Excel files containing thousands of rows. 
            </p>
            <div className="mt-4 inline-block bg-primary/10 border border-primary/30 text-primary px-5 py-3 rounded-xl font-semibold text-base md:text-lg max-w-4xl border-l-4">
              The reliance on manual audit review is time-consuming, error-prone, costly, and can lead to missed exceptions while putting pressure on auditor resources.
            </div>
          </div>

          <div className="w-full relative px-4">
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-5 flex items-center gap-3">
               The challenges faced include:
               <div className="flex-1 h-px bg-primary/30 ml-4 rounded-full" />
            </h3>

            {/* Grid Layout for challenges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {CHALLENGES.map((challenge, index) => (
                <div 
                  key={challenge.id}
                  className="group relative bg-[#111111] border border-white/10 hover:border-primary/50 rounded-2xl p-6 flex flex-col shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(134,188,37,0.3)] hover:-translate-y-1 overflow-hidden"
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards ${index * 0.2 + 0.3}s`,
                    opacity: 0,
                    transform: 'translateY(15px)'
                  }}
                >
                  <div className="absolute top-0 right-0 p-6 text-7xl font-black text-white/[0.03] group-hover:text-primary/[0.05] transition-colors pointer-events-none select-none leading-none">
                    {challenge.id}
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center mb-4 transition-colors shadow-inner relative z-10 shrink-0">
                    <div className="scale-75 origin-center">{challenge.icon}</div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2.5 group-hover:text-primary transition-colors relative z-10 text-balance leading-tight">
                    {challenge.title}
                  </h4>
                  
                  <p className="text-white/70 text-[14px] leading-snug group-hover:text-white/90 transition-colors relative z-10">
                    {challenge.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/20 via-[#488719]/20 to-transparent border-l-4 border-primary p-5 md:py-4 md:px-6 rounded-r-xl" style={{ animation: 'fadeInUp 0.6s ease-out forwards 0.9s', opacity: 0 }}>
              <p className="text-base text-white/90 leading-snug font-medium">
                Overall, these challenges undermine audit quality and scalability. Manual processes delay cycles, increase costs, and heighten the risk of missing critical exceptions. <span className="text-primary font-bold">A structured, AI-driven, automated analytical layer is required</span> to detect anomalies, recognize patterns, and generate explainable audit insights at scale.
              </p>
            </div>
          </div>

        </div>
      </main>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProblemDefinitionPage;
