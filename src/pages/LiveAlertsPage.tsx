import { useState, useMemo } from 'react';
import { Play, Eye, Group, BellOff, ArrowUp, Filter, Radio } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SeverityBadge, StatusBadge, FingerprintTag } from '@/components/Badges';
import { SimulatorModal } from '@/components/SimulatorModal';
import { timeHM } from '@/lib/hooks';
import { ACTION_COLORS } from '@/lib/simulation';

export function LiveAlertsPage() {
  const { alerts } = useStore();
  const [simOpen, setSimOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return alerts.filter(a =>
      (severityFilter === 'ALL' || a.severity === severityFilter) &&
      (actionFilter === 'ALL' || a.action === actionFilter)
    ).slice(0, 50);
  }, [alerts, severityFilter, actionFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Live Alerts</h1>
          <p className="text-sm text-slate-500">Real-time alert stream · {alerts.length} in buffer</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1.5 border border-rose-500/30">
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span className="text-xs font-semibold text-rose-300">LIVE</span>
          </div>
          <button onClick={() => setSimOpen(true)} className="btn-primary">
            <Play className="h-4 w-4" /> Simulate Alerts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500"><Filter className="h-3.5 w-3.5" /> Filters:</div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input w-auto py-1.5 text-xs">
          <option value="ALL">All severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input w-auto py-1.5 text-xs">
          <option value="ALL">All actions</option>
          <option value="GROUPED">Grouped</option>
          <option value="SUPPRESSED">Suppressed</option>
          <option value="ESCALATED">Escalated</option>
          <option value="DELIVERED">Delivered</option>
          <option value="MONITORED">Monitored</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-850/60 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Instance</th>
                <th className="px-4 py-3 font-medium">Error</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Fingerprint</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-bg-800/60 transition-colors animate-slide-in">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">{timeHM(a.timestamp)}</td>
                  <td className="px-4 py-3 text-slate-200">{a.service}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.instance}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-300">{a.error}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.severity} size="xs" /></td>
                  <td className="px-4 py-3"><FingerprintTag fp={a.fingerprint} /></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ACTION_COLORS[a.action]}`}>{a.action}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="View"><Eye className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn title="Group"><Group className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn title="Suppress"><BellOff className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn title="Escalate"><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No alerts match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SimulatorModal open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title} className="rounded-md p-1.5 text-slate-500 hover:bg-bg-700 hover:text-brand-300 transition-colors">
      {children}
    </button>
  );
}
