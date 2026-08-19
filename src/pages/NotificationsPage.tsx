import { Bell, Slack, MessageSquare, Phone, CheckCircle2, ExternalLink } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SeverityBadge } from '@/components/Badges';
import { formatNum, timeHM } from '@/lib/hooks';

export function NotificationsPage() {
  const { incidents } = useStore();
  const top = incidents[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Notification Center</h1>
        <p className="text-sm text-slate-500">Where AlertPulse delivers only meaningful incidents</p>
      </div>

      {/* Integrations */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Integration name="Slack" icon={<Slack className="h-5 w-5" />} color="text-emerald-300 bg-emerald-500/10 border-emerald-500/30" connected />
        <Integration name="PagerDuty" icon={<Phone className="h-5 w-5" />} color="text-brand-300 bg-brand-500/10 border-brand-500/30" connected />
        <Integration name="Discord" icon={<MessageSquare className="h-5 w-5" />} color="text-sky-300 bg-sky-500/10 border-sky-500/30" connected />
      </div>

      {/* Notification preview */}
      {top && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest Notification</p>

          {/* Slack-style card */}
          <div className="card overflow-hidden max-w-lg">
            <div className="border-l-4 border-rose-500 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-rose-500 text-xs font-bold text-white">!</span>
                <span className="text-sm font-bold text-rose-300">CRITICAL INCIDENT</span>
                <SeverityBadge severity={top.severity} size="xs" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">{top.title}</h3>
              <p className="mt-2 text-sm text-slate-300">
                AlertPulse grouped <span className="font-semibold text-white">{formatNum(top.occurrences)}</span> related alerts
                from <span className="font-semibold text-white">{top.affectedInstances.length}</span> instances into
                Incident <span className="font-semibold text-brand-300">#{top.id}</span>.
              </p>
              <div className="mt-3 rounded-lg bg-bg-900/60 p-3 text-xs text-slate-400">
                <div className="flex justify-between"><span>Fingerprint</span><span className="font-mono text-brand-300">{top.fingerprint}</span></div>
                <div className="mt-1 flex justify-between"><span>First seen</span><span className="text-slate-300">{timeHM(top.firstSeen)}</span></div>
                <div className="mt-1 flex justify-between"><span>Last seen</span><span className="text-slate-300">{timeHM(top.lastSeen)}</span></div>
              </div>
              <button className="btn-primary mt-4 w-full justify-center">
                <ExternalLink className="h-4 w-4" /> View Incident #{top.id}
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-line bg-bg-850/60 px-5 py-2.5">
              <span className="text-xs text-slate-500">Delivered via Slack · #oncall-alerts</span>
              <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Sent</span>
            </div>
          </div>

          {/* PagerDuty-style card */}
          <div className="card max-w-lg p-5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-300" />
              <span className="text-sm font-bold text-brand-300">PAGERDUTY ESCALATION</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">{top.title}</h3>
            <p className="mt-1 text-sm text-slate-400">Incident #{top.id} · {top.occurrences} occurrences · {top.affectedInstances.length} instances</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="badge bg-amber-500/10 text-amber-300 border border-amber-500/30">Escalated to Primary</span>
              <span className="badge bg-bg-700 text-slate-400">Acknowledged</span>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <Bell className="h-4 w-4" />
          <span className="text-sm">Mock delivery — no external credentials required for this prototype.</span>
        </div>
      </div>
    </div>
  );
}

function Integration({ name, icon, color, connected }: { name: string; icon: React.ReactNode; color: string; connected?: boolean }) {
  return (
    <div className="card card-hover flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${color}`}>{icon}</span>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-500">{connected ? 'Connected' : 'Not configured'}</p>
        </div>
      </div>
      {connected && <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>}
    </div>
  );
}
