import { Server } from 'lucide-react';
import { useStore } from '@/lib/store';
import { StatusBadge } from '@/components/Badges';
import type { PageId } from '@/components/Sidebar';

const STATUS_DOT: Record<string, string> = {
  Healthy: 'bg-emerald-400',
  Degraded: 'bg-amber-400',
  Down: 'bg-rose-400',
};

export function ServicesPage({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { services, alerts } = useStore();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Services</h1>
        <p className="text-sm text-slate-500">Monitored services and their health</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(s => {
          const svcAlerts = alerts.filter(a => a.service === s.name).slice(0, 5);
          return (
            <div key={s.name} className="card card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-700 text-brand-300">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s.status]} ${s.status !== 'Healthy' ? 'animate-pulse' : ''}`} />
                      <span className="text-xs text-slate-400">{s.status}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Metric label="Alerts" value={String(s.alertCount)} />
                <Metric label="Incidents" value={String(s.activeIncidents)} />
                <Metric label="Error Rate" value={`${s.errorRate}%`} />
              </div>

              {svcAlerts.length > 0 && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recent alerts</p>
                  <div className="space-y-1.5">
                    {svcAlerts.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-xs">
                        <span className="truncate text-slate-400">{a.error}</span>
                        <span className="font-mono text-slate-600">{a.instance}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => onNavigate('alerts')} className="mt-3 text-xs text-brand-400 hover:text-brand-300">View all alerts →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-850/60 p-2 border border-line">
      <p className="font-mono text-base font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
