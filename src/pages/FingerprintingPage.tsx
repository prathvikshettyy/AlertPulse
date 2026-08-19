import { Fingerprint, ArrowRight, GitBranch, CheckCircle2 } from 'lucide-react';
import { FingerprintTag, SeverityBadge } from '@/components/Badges';

const RAW_LOGS = [
  { server: 'server-01', ip: '10.0.1.21', req: '78231', line: 'psycopg.OperationalError: server closed the connection unexpectedly' },
  { server: 'server-02', ip: '10.0.1.34', req: '78289', line: 'psycopg.OperationalError: server closed the connection unexpectedly' },
  { server: 'server-03', ip: '10.0.1.47', req: '78312', line: 'psycopg.OperationalError: server closed the connection unexpectedly' },
  { server: 'server-05', ip: '10.0.1.52', req: '78401', line: 'psycopg.OperationalError: server closed the connection unexpectedly' },
  { server: 'server-07', ip: '10.0.1.68', req: '78455', line: 'psycopg.OperationalError: server closed the connection unexpectedly' },
];

const NORMALIZE = [
  { label: 'IP addresses', example: '10.0.1.21 → <IP>', color: 'text-sky-300' },
  { label: 'Timestamps', example: '2024-08-19T21:04:12Z → <TS>', color: 'text-amber-300' },
  { label: 'Request IDs', example: '78231 → <REQ_ID>', color: 'text-brand-300' },
  { label: 'User IDs', example: 'usr_8821 → <USER_ID>', color: 'text-emerald-300' },
];

const EXTRACT = [
  { label: 'Service', value: 'Payment Service' },
  { label: 'Error type', value: 'OperationalError / Timeout' },
  { label: 'Endpoint', value: '/api/v1/checkout' },
  { label: 'Stack pattern', value: 'psycopg.OperationalError: server closed connection' },
];

export function FingerprintingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Error Fingerprinting</h1>
        <p className="text-sm text-slate-500">Different logs can represent the same underlying problem — AlertPulse normalizes and groups them.</p>
      </div>

      {/* Flow diagram */}
      <div className="card grid-bg relative overflow-hidden p-6">
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          {/* Raw logs */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Raw Logs · 5 servers</p>
            <div className="space-y-2">
              {RAW_LOGS.map(l => (
                <div key={l.server} className="rounded-lg border border-line bg-bg-850/80 p-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-brand-300">{l.server}</span>
                    <span className="text-slate-600">IP: {l.ip} · REQ: {l.req}</span>
                  </div>
                  <p className="mt-1 truncate text-slate-300">{l.line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden flex-col items-center text-brand-400 lg:flex">
            <GitBranch className="h-8 w-8" />
            <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">normalize</span>
          </div>
          <div className="flex items-center justify-center text-brand-400 lg:hidden"><ArrowRight className="h-6 w-6 rotate-90" /></div>

          {/* Fingerprint */}
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Generated Fingerprint</p>
            <div className="inline-flex flex-col items-center rounded-xl border border-brand-500/30 bg-brand-500/10 p-5">
              <Fingerprint className="h-10 w-10 text-brand-400" />
              <FingerprintTag fp="DB_TIMEOUT_8F21" />
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">96% confidence</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden flex-col items-center text-brand-400 lg:flex">
            <ArrowRight className="h-8 w-8" />
            <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">aggregate</span>
          </div>
          <div className="flex items-center justify-center text-brand-400 lg:hidden"><ArrowRight className="h-6 w-6 rotate-90" /></div>

          {/* Incident */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Resulting Incident</p>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-rose-300">INCIDENT #1042</span>
                <SeverityBadge severity="CRITICAL" size="xs" />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Database Connection Failure</p>
              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p>500 occurrences</p>
                <p>18 instances affected</p>
                <p>1 fingerprint · 1 incident</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Normalization + extraction */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white">Dynamic Value Normalization</h2>
          <p className="mt-1 text-xs text-slate-500">Volatile values are masked before comparison</p>
          <div className="mt-4 space-y-2.5">
            {NORMALIZE.map(n => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border border-line bg-bg-850/60 p-3">
                <span className="text-sm text-slate-300">{n.label}</span>
                <span className={`font-mono text-xs ${n.color}`}>{n.example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white">Signature Extraction</h2>
          <p className="mt-1 text-xs text-slate-500">Stable signals used to build the fingerprint</p>
          <div className="mt-4 space-y-2.5">
            {EXTRACT.map(e => (
              <div key={e.label} className="flex items-center justify-between rounded-lg border border-line bg-bg-850/60 p-3">
                <span className="text-sm text-slate-300">{e.label}</span>
                <span className="font-mono text-xs text-brand-300">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
