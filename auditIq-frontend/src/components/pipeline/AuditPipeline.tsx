import { motion } from 'framer-motion';
import { useAuditStore } from '@/store/audit-store';
import { Check, Loader2 } from 'lucide-react';

const stages = [
  { id: 'ingest',   label: 'Data Ingestion' },
  { id: 'clean',    label: 'Cleaning' },
  { id: 'anomaly',  label: 'Anomaly Detection' },
  { id: 'pattern',  label: 'Pattern Analysis' },
  { id: 'validate', label: 'Validation' },
  { id: 'report',   label: 'Report Generation' },
] as const;

const stageIds = stages.map(s => s.id);

export const AuditPipeline = () => {
  const pipelineStage = useAuditStore(s => s.pipelineStage);
  const isProcessing = useAuditStore(s => s.isProcessing);

  // Only hide pipeline when completely idle and not processing
  if (pipelineStage === 'idle' && !isProcessing) return null;

  const currentIdx =
    pipelineStage === 'complete'
      ? stages.length
      : stageIds.indexOf(pipelineStage as any) >= 0
      ? stageIds.indexOf(pipelineStage as any)
      : 0;

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Multi-Agent Audit Pipeline
        </h3>
        {pipelineStage === 'complete' && (
          <span className="text-[10px] font-semibold text-success uppercase tracking-wider px-2 py-1 rounded-full bg-success/10">
            Analysis Complete
          </span>
        )}
        {isProcessing && pipelineStage !== 'complete' && (
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 flex items-center gap-1.5">
            <Loader2 size={10} className="animate-spin" />
            Processing...
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pb-8 pt-2 relative">
        {stages.map((stage, index) => {
          const isComplete = currentIdx > index;
          const isCurrent = currentIdx === index;

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: isComplete
                      ? '#22c55e'
                      : isCurrent
                      ? 'hsl(221, 83%, 53%)'
                      : '#e2e8f0',
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-9 h-9 rounded-full flex items-center justify-center relative z-10"
                >
                  {isComplete ? (
                    <Check size={16} className="text-white" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-white animate-spin" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                  )}
                </motion.div>
                <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-medium text-muted-foreground uppercase tracking-wider ${
                  index === 0 ? 'left-0' :
                  index === stages.length - 1 ? 'right-0' :
                  'left-1/2 -translate-x-1/2'
                }`}>
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className="h-[2px] flex-1 mx-3 bg-border overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentIdx > index ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="h-full bg-success"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
