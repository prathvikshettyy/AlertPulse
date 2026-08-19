import { useState } from 'react';
import {
  AlertTriangle, Eye, CheckCircle2, ArrowUp, BellOff, Clock, Server,
  Fingerprint, Activity, X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { SeverityBadge, StatusBadge, FingerprintTag } from '@/components/Badges';
import { formatNum, timeAgo, timeHM } from '@/lib/hooks';
import type { Incident } from '@/lib/types';

export function IncidentsPage() {
  const { incidents, ackIncident, resolveIncident, escalateIncident, suppressIncident } = useStore();
  const [selected, setSelected] = useState<Incident | null>(null);

  const selectedLive = selected ? incidents.find(i => i.id === selected.id) || selected : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Incidents</h1>
        <p className="text-sm text-slate-500">Aggregated, deduplicated incidents — one entry per underlying problem</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {incidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => setSelected(inc)}
            className="card card-hover text-left p-5 transition-all hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-brand-300">#{inc.id}</span>
                <SeverityBadge severity={inc.severity} size="xs" />
              </div>
              <StatusBadge status={inc.status} />
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">{inc.title}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {formatNum(inc.occurrences)} occurrences</span>
              <span className="flex items-center gap-1"><Server className="h-3 w-3" /> {inc.affectedInstances.length} instances</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(inc.firstSeen)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <FingerprintTag fp={inc.fingerprint} />
              <span className="text-xs text-slate-500">{inc.services.join(', ')}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedLive && (
        <IncidentDrawer
          incident={selectedLive}
          onClose={() => setSelected(null)}
          onAck={() => ackIncident(selectedLive.id)}
          onResolve={() => resolveIncident(selectedLive.id)}
          onEscalate={() => escalateIncident(selectedLive.id)}
          onSuppress={() => suppressIncident(selectedLive.id)}
        />
      )}
    </div>
  );
}

function IncidentDrawer({
  incident, onClose, onAck, onResolve, onEscalate, onSuppress,
}: {
  incident: Incident;
  onClose: () => void;
  onAck: () => void;
  onResolve: () => void;
  onEscalate: () => void;
  onSuppress: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-bg-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg animate-slide-in overflow-y-auto border-l border-line bg-bg-850 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg-850/95 p-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-300">#{incident.id}</span>
              <SeverityBadge severity={incident.severity} size="xs" />
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">{incident.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-bg-700 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Activity className="h-4 w-4" />} label="Occurrences" value={formatNum(incident.occurrences)} />
            <Stat icon={<Server className="h-4 w-4" />} label="Affected Instances" value={String(incident.affectedInstances.length)} />
            <Stat icon={<Clock className="h-4 w-4" />} label="First Seen" value={timeHM(incident.firstSeen)} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Last Seen" value={timeHM(incident.lastSeen)} />
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Fingerprint className="h-3.5 w-3.5" /> Fingerprint
            </div>
            <div className="mt-2"><FingerprintTag fp={incident.fingerprint} /></div>
            <p className="mt-3 text-xs text-slate-500">Source services</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {incident.services.map(s => <span key={s} className="badge bg-bg-700 text-slate-300">{s}</span>)}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white">Incident Timeline</h3>
            <div className="mt-4 space-y-0">
              {incident.timeline.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${i === incident.timeline.length - 1 ? 'bg-rose-400' : 'bg-brand-400'}`} />
                    {i < incident.timeline.length - 1 && <div className="h-10 w-px bg-line" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-mono text-xs text-slate-500">{timeHM(e.t)}</p>
                    <p className="text-sm text-slate-200">{e.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected instances */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white">Affected Instances</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {incident.affectedInstances.map(inst => (
                <span key={inst} className="font-mono text-xs rounded-md bg-bg-700 px-2 py-1 text-slate-300">{inst}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onAck} className="btn-outline justify-center"><Eye className="h-4 w-4" /> Acknowledge</button>
            <button onClick={onEscalate} className="btn-outline justify-center text-rose-300 border-rose-500/30 hover:border-rose-500/50"><ArrowUp className="h-4 w-4" /> Escalate</button>
            <button onClick={onResolve} className="btn-outline justify-center text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50"><CheckCircle2 className="h-4 w-4" /> Resolve</button>
            <button onClick={onSuppress} className="btn-outline justify-center text-slate-400"><BellOff className="h-4 w-4" /> Suppress</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-800/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">{icon} {label}</div>
      <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
    </div>
  );
}

void AlertTriangle;
