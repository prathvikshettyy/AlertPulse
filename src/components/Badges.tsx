import type { Severity } from '@/lib/types';
import { SEVERITY_COLORS } from '@/lib/simulation';

export function SeverityBadge({ severity, size = 'sm' }: { severity: Severity; size?: 'sm' | 'xs' }) {
  const c = SEVERITY_COLORS[severity];
  return (
    <span className={`badge ${c.bg} ${c.text} border ${c.border} ${size === 'xs' ? 'px-1.5 py-0 text-[10px]' : ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    Cooldown: 'bg-slate-600/20 text-slate-400 border border-slate-600/40',
    Resolved: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    Investigating: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    INVESTIGATING: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    ACKNOWLEDGED: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
    ESCALATED: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    RESOLVED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    SUPPRESSED: 'bg-slate-600/20 text-slate-400 border border-slate-600/40',
    Healthy: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    Degraded: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    Down: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    Monitoring: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
  };
  return <span className={`badge ${map[status] || 'bg-bg-700 text-slate-300 border border-line'}`}>{status}</span>;
}

export function FingerprintTag({ fp }: { fp: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-bg-850 px-2 py-0.5 font-mono text-[11px] text-brand-300 border border-line">
      {fp}
    </span>
  );
}
