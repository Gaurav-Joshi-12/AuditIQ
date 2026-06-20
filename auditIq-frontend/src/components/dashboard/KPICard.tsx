import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'destructive' | 'warning' | 'success';
}

const colorMap = {
  primary: 'bg-primary-light text-primary',
  destructive: 'bg-destructive-light text-destructive',
  warning: 'bg-warning-light text-warning',
  success: 'bg-success-light text-success',
};

export const KPICard = ({ label, value, subtitle, icon, trend, trendValue, color = 'primary' }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    className="bg-card rounded-lg border border-border shadow-card p-5 hover:shadow-card-hover animate-professional"
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className={`p-2 rounded-md ${colorMap[color]}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-foreground tracking-tight font-mono">{value}</div>
    <div className="flex items-center gap-2 mt-2">
      {trend && (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
          trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-success' : 'text-muted-foreground'
        }`}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
          {trendValue}
        </span>
      )}
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  </motion.div>
);
