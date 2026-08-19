import { useMemo } from 'react';
import { Gauge, Zap, BellOff, Group, ArrowUp, RefreshCw, XCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Severity, AlertAction } from '@/lib/types';

const RULES: { condition: string; action: AlertAction; icon: React.ReactNode; color: string }[] = [
  { condition: 'New Critical Alert', action: 'DELIVERED', icon: <Zap className="h-4 w-4" />, color: 'text-rose-300 bg-rose-500/10 border-rose-500/30' },
  { condition: 'Repeated Low Severity', action: 'SUPPRESSED', icon: <BellOff className="h-4 w-4" />, color: 'text-slate-300 bg-slate-600/20 border-slate-600/40' },
  { condition: 'Similar Alerts Across Instances', action: 'GROUPED', icon: <Group className="h-4 w-4" />, color: 'text-brand-300 bg-brand-500/10 border-brand-500/30' },
  { condition: 'Rapidly Increasing Errors', action: 'ESCALATED', icon: <ArrowUp className="h-4 w-4" />, color: 'text-rose-300 bg-rose-500/10 border-rose-500/30' },
  { condition: 'Repeated Alert During Cooldown', action: 'SUPPRESSED', icon: <RefreshCw className="h-4 w-4" />, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  { condition: 'Resolved Alert', action: 'MONITORED', icon: <XCircle className="h-4 w-4" />, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
];

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function CooldownPage() {
  const { cooldown, setCooldown } = useStore();

  const preview = useMemo(() => {
    const data = [];
    for (let i = 0; i < 10; i++) {
      const alertCount = (i + 1) * 60;
      const sev = SEVERITIES[Math.min(3, Math.floor(i / 3))];
      const cdMs = cooldown.severity[sev] * 1000;
      let delivered = 0;
      let suppressed = 0;
      for (let j = 0; j < alertCount; j++) {
        if (cdMs === 0) delivered++;
        else if (j % Math.max(1, Math.floor(cdMs / 100)) === 0) delivered++;
        else suppressed++;
      }
      data.push({ burst: `${alertCount}`, delivered, suppressed });
    }
    return data;
  }, [cooldown]);

  const updateSev = (sev: Severity, val: number) => {
    setCooldown({ ...cooldown, severity: { ...cooldown.severity, [sev]: val } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Adaptive Cooldown Matrix</h1>
        <p className="text-sm text-slate-500">Rules that decide how each alert is treated, and cooldown durations per severity.</p>
      </div>

      {/* Rules matrix */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 border-b border-line bg-bg-850/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div>Condition</div>
          <div>Action</div>
        </div>
        <div className="divide-y divide-line">
          {RULES.map(r => (
            <div key={r.condition} className="grid grid-cols-2 items-center px-5 py-4 hover:bg-bg-800/40 transition-colors">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${r.color}`}>{r.icon}</span>
                {r.condition}
              </div>
              <div className="justify-self-start">
                <span className={`badge border ${r.color}`}>{r.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Severity cooldowns */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Severity Cooldowns</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Seconds before a repeated alert of this severity is re-sent</p>
          <div className="mt-4 space-y-4">
            {SEVERITIES.map(sev => (
              <div key={sev}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">{sev}</span>
                  <span className="font-mono text-xs text-brand-300">{cooldown.severity[sev]}s</span>
                </div>
                <input
                  type="range" min={0} max={120} step={5}
                  value={cooldown.severity[sev]}
                  onChange={e => updateSev(sev, Number(e.target.value))}
                  className="mt-2 w-full accent-brand-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Frequency thresholds */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white">Frequency Thresholds</h2>
          <p className="mt-1 text-xs text-slate-500">Action taken as alert frequency increases</p>
          <div className="mt-4 space-y-2.5">
            {cooldown.frequency.map(f => (
              <div key={f.range} className="flex items-center justify-between rounded-lg border border-line bg-bg-850/60 p-3">
                <span className="font-mono text-sm text-slate-300">{f.range}</span>
                <span className="badge bg-brand-500/10 text-brand-300 border border-brand-500/30">{f.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview chart */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Live Impact Preview</h2>
            <p className="text-xs text-slate-500">How the current cooldown settings affect output as alert volume rises</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />Delivered</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-amber-400" />Suppressed</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={preview} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="burst" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111722', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="suppressed" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
              <Bar dataKey="delivered" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
