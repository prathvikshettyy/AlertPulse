import { useState } from 'react';
import { Bell, Filter, Send, AlertTriangle, Flame, Zap, Play, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useStore } from '@/lib/store';
import { KpiCard } from '@/components/KpiCard';
import { SeverityBadge, StatusBadge } from '@/components/Badges';
import { SimulatorModal } from '@/components/SimulatorModal';
import { timeHM, formatNum, useAnimatedNumber } from '@/lib/hooks';
import type { PageId } from '@/components/Sidebar';

export function OverviewPage({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { metrics, volume, groups, incidents } = useStore();
  const [simOpen, setSimOpen] = useState(false);

  const noiseRatio = metrics.received > 0
    ? ((metrics.received - metrics.delivered) / metrics.received) * 100
    : 0;
  const noiseAnimated = useAnimatedNumber(Math.round(noiseRatio * 10) / 10);

  const chartData = volume.map(v => ({
    time: timeHM(v.t),
    incoming: v.incoming,
    filtered: v.filtered,
    delivered: v.delivered,
  }));

  return (
    <div className="space-y-6">
      {/* Hero / headline */}
      <div className="card relative overflow-hidden p-6">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Intelligent Alert Middleware</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Turn alert noise into actionable incidents.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              AlertPulse sits between your monitoring systems and notification platforms — fingerprinting, deduplicating, and grouping alerts so engineers only see what matters.
            </p>
          </div>
          <button onClick={() => setSimOpen(true)} className="btn-primary shrink-0 text-base px-5 py-3">
            <Play className="h-5 w-5" /> Run Alert Simulation
          </button>
        </div>

        <div className="relative mt-6 flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <span className="font-mono text-3xl font-extrabold text-rose-300 sm:text-4xl">{formatNum(500)}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Alerts</span>
          <ArrowRight className="h-6 w-6 text-brand-400" />
          <span className="rounded-md bg-bg-700 px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-brand-300">ALERTPULSE</span>
          <ArrowRight className="h-6 w-6 text-brand-400" />
          <span className="font-mono text-3xl font-extrabold text-emerald-300 sm:text-4xl">1</span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Incident</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Noise Reduction Ratio" value={Math.round(noiseRatio * 10) / 10} sub={`${noiseAnimated.toFixed(1)}% of alerts filtered`} accent="brand" icon={<Filter className="h-5 w-5" />} big />
        <KpiCard label="Alerts Received" value={metrics.received} accent="slate" icon={<Bell className="h-5 w-5" />} />
        <KpiCard label="Alerts Filtered" value={metrics.filtered} accent="amber" icon={<Filter className="h-5 w-5" />} />
        <KpiCard label="Alerts Delivered" value={metrics.delivered} accent="emerald" icon={<Send className="h-5 w-5" />} />
        <KpiCard label="Active Incidents" value={metrics.activeIncidents} accent="sky" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="Critical Incidents" value={metrics.criticalIncidents} accent="rose" icon={<Flame className="h-5 w-5" />} />
      </div>

      {/* Chart + top groups */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Alert Volume</h2>
              <p className="text-xs text-slate-500">Incoming vs filtered vs delivered · last 30 min</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend2 color="bg-rose-400" label="Incoming" />
              <Legend2 color="bg-amber-400" label="Filtered" />
              <Legend2 color="bg-emerald-400" label="Delivered" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111722', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="incoming" stroke="#fb7185" strokeWidth={2} fill="url(#gInc)" />
                <Area type="monotone" dataKey="filtered" stroke="#fbbf24" strokeWidth={2} fill="url(#gFil)" />
                <Area type="monotone" dataKey="delivered" stroke="#34d399" strokeWidth={2} fill="url(#gDel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Alert Groups</h2>
            <button onClick={() => onNavigate('groups')} className="text-xs text-brand-400 hover:text-brand-300">View all →</button>
          </div>
          <div className="space-y-2.5">
            {groups.slice(0, 5).map(g => (
              <div key={g.fingerprint} className="flex items-center justify-between rounded-lg border border-line bg-bg-850/60 p-3 hover:border-bg-600 transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{g.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{g.service} · {g.instances} instances</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-300">{g.occurrences}</span>
                  <SeverityBadge severity={g.severity} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent incidents teaser */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Incidents</h2>
          <button onClick={() => onNavigate('incidents')} className="text-xs text-brand-400 hover:text-brand-300">View all →</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {incidents.slice(0, 3).map(inc => (
            <button key={inc.id} onClick={() => onNavigate('incidents')} className="text-left rounded-lg border border-line bg-bg-850/60 p-4 hover:border-bg-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brand-300">#{inc.id}</span>
                <StatusBadge status={inc.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">{inc.title}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{inc.occurrences} occurrences</span>
                <SeverityBadge severity={inc.severity} size="xs" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <SimulatorModal open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}

function Legend2({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-400">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
