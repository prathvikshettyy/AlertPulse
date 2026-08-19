import { Settings, Zap, Shield, Database, Webhook, Save } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500">AlertPulse configuration and integrations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section icon={<Zap className="h-4 w-4" />} title="Engine">
          <Row label="Fingerprinting" value="Enabled" />
          <Row label="Similarity detection" value="96% threshold" />
          <Row label="Auto-grouping" value="Enabled" />
          <Row label="Adaptive cooldown" value="Enabled" />
        </Section>

        <Section icon={<Shield className="h-4 w-4" />} title="Escalation Policy">
          <Row label="Critical → page on-call" value="Immediate" />
          <Row label="High → notify channel" value="15s cooldown" />
          <Row label="Medium → group & monitor" value="30s cooldown" />
          <Row label="Low → suppress duplicates" value="60s cooldown" />
        </Section>

        <Section icon={<Database className="h-4 w-4" />} title="Backend Architecture">
          <Row label="API" value="FastAPI (Python)" />
          <Row label="Cache" value="Redis" />
          <Row label="Database" value="PostgreSQL" />
          <Row label="Monitoring" value="Prometheus" />
          <Row label="Deploy" value="Docker" />
        </Section>

        <Section icon={<Webhook className="h-4 w-4" />} title="API Endpoints">
          <Endpoint method="POST" path="/api/alerts" />
          <Endpoint method="GET" path="/api/alerts" />
          <Endpoint method="GET" path="/api/incidents" />
          <Endpoint method="POST" path="/api/incidents" />
          <Endpoint method="POST" path="/api/simulate" />
          <Endpoint method="GET" path="/api/analytics" />
          <Endpoint method="PUT" path="/api/cooldown" />
        </Section>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary"><Save className="h-4 w-4" /> Save Changes</button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="text-brand-400">{icon}</span>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 divide-y divide-line">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    POST: 'bg-brand-500/10 text-brand-300 border-brand-500/30',
    PUT: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };
  return (
    <div className="flex items-center gap-3 py-2 text-sm">
      <span className={`badge border font-mono text-[10px] ${colors[method]}`}>{method}</span>
      <span className="font-mono text-xs text-slate-300">{path}</span>
    </div>
  );
}

void Settings;
