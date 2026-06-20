import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileSpreadsheet, Zap, Eraser, BrainCircuit, 
  Network, ShieldCheck, FileText, LayoutDashboard, Play, Pause, RotateCcw, Lightbulb, X, Server, Database
} from 'lucide-react';

const STEPS = [
  {
    id: 'ingest',
    title: 'Data Ingestion',
    description: 'Organization securely uploads Excel ledgers via App Maker.',
    icon: FileSpreadsheet,
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    activeClass: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    module: 'App Maker',
  },
  {
    id: 'kafka',
    title: 'Kafka Event Streaming',
    description: 'High-throughput ingestion pub/sub queue handling high-volume ledger data streams.',
    icon: Server,
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    activeClass: 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]',
    module: 'System Architecture',
  },
  {
    id: 'datalake',
    title: 'Raw Data Lake',
    description: 'Durable storage persisting incoming Kafka streams before processing.',
    icon: Database,
    color: 'bg-teal-500',
    textColor: 'text-teal-500',
    borderColor: 'border-teal-500',
    activeClass: 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.5)]',
    module: 'System Architecture',
  },
  {
    id: 'clean',
    title: 'Data Cleaner Agent',
    description: 'Normalizes dates, removes nulls, deduplicates, and maps schema.',
    icon: Eraser,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    borderColor: 'border-cyan-500',
    activeClass: 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    module: 'Agent Builder',
  },
  {
    id: 'anomaly',
    title: 'Realm AI Detection',
    description: 'Generative AI classifies entries as Normal, Suspicious, or High-Risk.',
    icon: BrainCircuit,
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    activeClass: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    module: 'Realm AI',
  },
  {
    id: 'pattern',
    title: 'Pattern Agent',
    description: 'Executes cross-vendor and cross-period aggregations for systemic fraud.',
    icon: Network,
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
    borderColor: 'border-pink-500',
    activeClass: 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    module: 'Agent Builder',
  },
  {
    id: 'validation',
    title: 'Validation Agent',
    description: 'Cross-checks every entry against predefined compliance rules.',
    icon: ShieldCheck,
    color: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
    activeClass: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    module: 'Agent Builder',
  },
  {
    id: 'report-gen',
    title: 'Report Generator Agent',
    description: 'Assembles exceptions into structured JSON with AI narratives.',
    icon: FileText,
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500',
    activeClass: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    module: 'Agent Builder',
  },
  {
    id: 'visualize',
    title: 'Visualization Module',
    description: 'Consumes enriched dataset to render interactive audit dashboards.',
    icon: LayoutDashboard,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500',
    activeClass: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    module: 'Playground',
  },
  {
    id: 'auditor',
    title: 'Final Audit Review',
    description: 'Auditor reviews flags, exports PDF report, and shares securely.',
    icon: Zap,
    color: 'bg-primary',
    textColor: 'text-primary',
    borderColor: 'border-primary',
    activeClass: 'border-primary shadow-[0_0_20px_hsla(86,65%,44%,0.5)]',
    module: 'App Maker',
  }
];

const USPS = [
  { id: '01', title: 'Multi-Agent Parallel Audit Pipeline', desc: 'Six specialized GenWAI agents running in parallel to reduce processing time.' },
  { id: '02', title: 'Natural Language Audit Querying', desc: 'Auditors type plain English queries and get instant filtered results.' },
  { id: '03', title: 'AI Generated Audit Narrative', desc: 'Each flagged transaction receives an auto-generated, human-readable explanation.' },
  { id: '04', title: 'Risk Tiered Exception Prioritization', desc: 'Exceptions are automatically binned into Critical, Moderate, and Low tiers.' },
  { id: '05', title: 'Vendor Relationship Graph Intelligence', desc: 'Detects shell companies and circular payment patterns using vendor network graphs.' },
  { id: '06', title: 'Configurable Compliance Rule Engine', desc: 'Auditors modify threshold rules directly through the UI without code changes.' },
  { id: '07', title: 'Continuous Audit Mode', desc: 'Scheduled pipeline monitoring new ledger data automatically for real-time compliance.' },
  { id: '08', title: 'Audit Workpaper Auto Population', desc: 'Report Generator Agent auto-fills standardized Deloitte audit workpaper templates.' },
  { id: '09', title: 'Explainable AI Confidence Scoring', desc: 'Anomaly decisions include confidence scores and contributing factors for transparency.' },
];

const SimulationPage = () => {
  const navigate = useNavigate();
  // Start fully lit and complete so that screenshots are instant and vibrant by default.
  const [currentStep, setCurrentStep] = useState(STEPS.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUSPs, setShowUSPs] = useState(false);

  // Auto-play logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < STEPS.length) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000); // Faster duration for single-screen viewing
    } else if (currentStep >= STEPS.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlayPause = () => {
    if (currentStep >= STEPS.length) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-md hover:bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Zap size={14} className="text-primary fill-primary/20" />
              Deloitte GenWAI Audit Pipeline
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowUSPs(true)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors bg-primary/10 text-primary hover:bg-primary/20 mr-2"
          >
            <Lightbulb size={14} /> 9 USPs Pullout
          </button>

          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
            <button 
              onClick={reset}
              className="px-3 py-1 rounded-md hover:bg-background text-xs font-semibold text-muted-foreground flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          <div className="w-px h-4 bg-border"></div>
          <button 
            onClick={handlePlayPause}
            className={`px-4 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPlaying 
                ? 'bg-warning/10 text-warning hover:bg-warning/20' 
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isPlaying ? (
              <><Pause size={14} /> Pause</>
            ) : (
              <><Play size={14} className={currentStep >= STEPS.length ? 'hidden' : ''} /> {currentStep >= STEPS.length ? 'Replay' : 'Play'}</>
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Main Flowchart Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 overflow-hidden">
        
        <div className="mb-8 text-center shrink-0">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Audit Analytics Solution Blueprint</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Visualizing the end-to-end multi-agent AI pipeline. Watch how raw ledgers translate into consulting-grade insights.
          </p>
        </div>

        {/* Snake Flowchart Grid */}
        <div className="grid grid-cols-5 gap-x-6 gap-y-12 w-full max-w-7xl relative z-0">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <div 
                key={step.id}
                className="relative flex flex-col"
                style={{
                  gridColumn: index < 5 ? index + 1 : 10 - index,
                  gridRow: index < 5 ? 1 : 2
                }}
              >
                {/* Horizontal Connectors (Row 1) */}
                {index < 4 && (
                  <div className="absolute top-[45%] left-full w-6 h-1 bg-surface-elevated -z-10 -translate-y-1/2 overflow-hidden">
                    <div className={`h-full bg-primary transition-all ease-linear ${isPast ? 'w-full' : 'w-0'}`} style={{ transitionDuration: '0.8s' }} />
                  </div>
                )}
                {/* Vertical Connector (Right Edge) */}
                {index === 4 && (
                  <div className="absolute top-full left-1/2 w-1 h-12 bg-surface-elevated -z-10 -translate-x-1/2 overflow-hidden">
                    <div className={`w-full bg-primary transition-all ease-linear ${isPast ? 'h-full' : 'h-0'}`} style={{ transitionDuration: '0.8s' }} />
                  </div>
                )}
                {/* Horizontal Connectors (Row 2, reversed direction) */}
                {index >= 5 && index < 9 && (
                  <div className="absolute top-[45%] right-full w-6 h-1 bg-surface-elevated -z-10 -translate-y-1/2 overflow-hidden">
                    <div className={`h-full bg-primary align-right right-0 absolute transition-all ease-linear ${isPast ? 'w-full' : 'w-0'}`} style={{ transitionDuration: '0.8s' }} />
                  </div>
                )}

                {/* Card */}
                <div className={`flex flex-col items-center text-center p-4 rounded-xl border-2 bg-card h-[160px] transition-all duration-500 z-10 relative overflow-hidden
                  ${(isActive || isPast) ? `${step.activeClass} scale-105` 
                    : 'border-border/50 opacity-60'}`}>
                  
                  {/* Number Badge */}
                  <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${(isActive || isPast) ? `${step.color} text-white` : 'bg-surface text-muted-foreground'}`}>
                    {index + 1}
                  </div>

                  {/* Module Badge */}
                  <div className={`absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${(isActive || isPast) 
                      ? `${step.color} ${step.borderColor} text-white shadow-sm` 
                      : 'bg-surface/50 border-border/50 text-muted-foreground'
                  }`}>
                    {step.module}
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 mt-1 transition-all duration-500 shrink-0 ${(isActive || isPast) ? `${step.color} text-white shadow-lg` : 'bg-surface text-muted-foreground'
                  }`}>
                    <step.icon size={24} className={isActive ? 'animate-pulse' : ''} />
                  </div>

                  <h3 className={`text-sm leading-tight font-bold mb-1.5 ${(isActive || isPast) ? step.textColor : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>

                  <p className="text-[10px] text-muted-foreground leading-snug line-clamp-3">
                    {step.description}
                  </p>

                  {/* Processing indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl">
                       <div className={`w-1/3 h-full ${step.color} animate-scan-fast rounded-full`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Completion Message */}
        <div className={`mt-8 shrink-0 transition-opacity duration-1000 ${currentStep >= STEPS.length ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success bg-success/10 px-4 py-1.5 rounded-full border border-success/20">
              <ShieldCheck size={16} /> Pipeline Execution Complete
            </span>
            <button 
              onClick={() => navigate('/auditor/dashboard')}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Analytics Dashboard
            </button>
          </div>
        </div>

      </main>
      
      <style>{`
        @keyframes scanFast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-scan-fast {
          animation: scanFast 1s ease-in-out infinite;
        }
      `}</style>
      
      {/* USPs Slide-out Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${showUSPs ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Lightbulb className="text-warning" size={18} />
            <span className="text-sm">9 Unique Selling Props</span>
          </div>
          <button onClick={() => setShowUSPs(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-muted-foreground mb-4">Use these talking points to explain the blueprint's core value.</p>
          {USPS.map(usp => (
            <div key={usp.id} className="bg-surface rounded-lg p-3 border border-border/50">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{usp.id}</span>
                <h4 className="text-xs font-bold leading-tight">{usp.title}</h4>
              </div>
              <p className="text-[10px] text-muted-foreground ml-[26px] leading-snug">{usp.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SimulationPage;
