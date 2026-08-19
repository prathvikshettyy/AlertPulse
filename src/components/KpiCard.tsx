import { useAnimatedNumber, formatNum } from '@/lib/hooks';

export function KpiCard({
  label, value, sub, accent = 'brand', icon, big,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
  icon?: React.ReactNode;
  big?: boolean;
}) {
  const v = useAnimatedNumber(value);
  const accents: Record<string, { ring: string; text: string; glow: string }> = {
    brand: { ring: 'from-brand-500/20', text: 'text-brand-300', glow: 'shadow-brand-500/10' },
    emerald: { ring: 'from-emerald-500/20', text: 'text-emerald-300', glow: 'shadow-emerald-500/10' },
    amber: { ring: 'from-amber-500/20', text: 'text-amber-300', glow: 'shadow-amber-500/10' },
    rose: { ring: 'from-rose-500/20', text: 'text-rose-300', glow: 'shadow-rose-500/10' },
    sky: { ring: 'from-sky-500/20', text: 'text-sky-300', glow: 'shadow-sky-500/10' },
    slate: { ring: 'from-slate-500/20', text: 'text-slate-300', glow: 'shadow-slate-500/10' },
  };
  const a = accents[accent];
  return (
    <div className={`card card-hover relative overflow-hidden p-5 ${big ? 'lg:col-span-2' : ''}`}>
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${a.ring} to-transparent`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-2 font-bold tracking-tight ${big ? 'text-5xl' : 'text-3xl'} ${a.text}`}>
            {formatNum(v)}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && <div className={`rounded-lg bg-bg-700 p-2 ${a.text}`}>{icon}</div>}
      </div>
    </div>
  );
}
