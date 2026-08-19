import { useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Bell, Filter, Send, TrendingDown, Zap, Clock, ArrowUp } from 'lucide-react';
import { useStore } from '@/lib/store';
import { KpiCard } from '@/components/KpiCard';
import { useAnimatedNumber, formatNum } from '@/lib/hooks';

const PIE_COLORS = ['#38bdf8', '#fbbf24', '#fb923c', '#fb7185'];

export function AnalyticsPage() {
  const { metrics, groups, services } = useStore();

  const beforeAfter = [
    { name: 'Before AlertPulse', value: 12450, fill: '#fb7185' },
    { name: 'After AlertPulse', value: 1470, fill: '#34d399' },
  ];

  const noiseOverTime = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const ratio = 78 + Math.sin(i / 2) * 6 + Math.random() * 4;
      out.push({ week: `W${i + 1}`, ratio: Math.round(ratio * 10) / 10 });
    }
    return out;
  }, []);

  const bySeverity = [
    { name: 'LOW', value: 4200 },
    { name: 'MEDIUM', value: 3800 },
    { name: 'HIGH', value: 2900 },
    { name: 'CRITICAL', value: 1550 },
  ];

  const topFingerprints = groups.slice(0, 5).map(g => ({ name: g.fingerprint, count: g.occurrences }));
  while (topFingerprints.length < 5) topFingerprints.push({ name: `FP_${topFingerprints.length}`, count: Math.floor(Math.random() * 200) });

  const byService = services.map(s => ({ name: s.name.split(' ')[0], count: s.alertCount }));

  const avgPerIncident = metrics.activeIncidents > 0 ? Math.round(metrics.received / Math.max(1, metrics.activeIncidents)) : 0;
  const noiseRatio = Math.round(((metrics.received - metrics.delivered) / metrics.received) * 1000) / 10;
  const noiseAnim = useAnimatedNumber(noiseRatio);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-500">Effectiveness of AlertPulse across your alert stream</p>
      </div>

      {/* Hero noise reduction */}
      <div className="card grid-bg relative overflow-hidden p-6 text-center">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Noise Reduction</p>
          <p className="mt-2 text-6xl font-extrabold text-emerald-300 sm:text-7xl">{noiseAnim.toFixed(1)}%</p>
          <p className="mt-3 text-sm text-slate-400">
            Before AlertPulse: <span className="font-semibold text-rose-300">{formatNum(12450)}</span> notifications
            <span className="mx-2 text-slate-600">→</span>
            After: <span className="font-semibold text-emerald-300">{formatNum(1470)}</span> notifications
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatNum(10980)} notifications reduced</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Alerts" value={metrics.received} accent="slate" icon={<Bell className="h-5 w-5" />} />
        <KpiCard label="Filtered" value={metrics.filtered} accent="amber" icon={<Filter className="h-5 w-5" />} />
        <KpiCard label="Delivered" value={metrics.delivered} accent="emerald" icon={<Send className="h-5 w-5" />} />
        <KpiCard label="Avg Alerts / Incident" value={avgPerIncident} accent="brand" icon={<Zap className="h-5 w-5" />} />
        <KpiCard label="Avg Response Time" value={4} sub="minutes" accent="sky" icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Critical Escalations" value={metrics.criticalIncidents} accent="rose" icon={<ArrowUp className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Alerts Before vs After Filtering">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={beforeAfter} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {beforeAfter.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Noise Reduction Over Time">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={noiseOverTime} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="gNoise" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[70, 95]} />
              <Tooltip contentStyle={tooltip} />
              <Area type="monotone" dataKey="ratio" stroke="#34d399" strokeWidth={2} fill="url(#gNoise)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts by Severity">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={bySeverity} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {bySeverity.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} stroke="#0a0e14" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Error Fingerprints">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topFingerprints} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="count" fill="#0bb5d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Incidents by Service" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byService} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const tooltip = { background: '#111722', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 };

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      <div className="h-56">{children}</div>
    </div>
  );
}

void TrendingDown;
