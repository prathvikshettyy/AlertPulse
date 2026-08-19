import { useState } from 'react';
import { Play, X, Loader2, ArrowDown, Zap, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Severity, SimType } from '@/lib/types';
import { formatNum } from '@/lib/hooks';

const SIM_TYPES: SimType[] = ['Database Failure', 'CPU Spike', 'API Failure', 'Memory Spike', 'Custom Error'];
const COUNTS = [10, 50, 100, 500, 1000];
const INSTANCES = [1, 5, 10, 20];
const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function SimulatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { runSimulation } = useStore();
  const [type, setType] = useState<SimType>('Database Failure');
  const [count, setCount] = useState(500);
  const [instances, setInstances] = useState(10);
  const [severity, setSeverity] = useState<Severity>('CRITICAL');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ generated: number; duplicates: number; grouped: number; suppressed: number; delivered: number; incidentCreated: boolean } | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const start = async () => {
    setRunning(true);
    setDone(false);
    setProgress({ generated: 0, duplicates: 0, grouped: 0, suppressed: 0, delivered: 0, incidentCreated: false });
    await runSimulation({ type, count, instances, severity }, (p) => setProgress(p));
    setRunning(false);
    setDone(true);
  };

  const close = () => {
    if (running) return;
    onClose();
    setTimeout(() => {
      setDone(false);
      setProgress(null);
    }, 200);
  };

  const pct = progress ? Math.round((progress.generated / count) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-900/80 backdrop-blur-sm" onClick={() => !running && close()} />
      <div className="relative w-full max-w-2xl animate-fade-in card bg-bg-850 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Alert Simulator</h2>
              <p className="text-xs text-slate-500">Generate a burst of alerts and watch AlertPulse consolidate them</p>
            </div>
          </div>
          <button onClick={close} disabled={running} className="rounded-lg p-1.5 text-slate-400 hover:bg-bg-700 hover:text-white disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!done && (
            <>
              <Field label="Simulation type">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SIM_TYPES.map(t => (
                    <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Number of alerts">
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTS.map(c => <Chip key={c} active={count === c} onClick={() => setCount(c)}>{c}</Chip>)}
                  </div>
                </Field>
                <Field label="Instances">
                  <div className="flex flex-wrap gap-1.5">
                    {INSTANCES.map(i => <Chip key={i} active={instances === i} onClick={() => setInstances(i)}>{i}</Chip>)}
                  </div>
                </Field>
                <Field label="Severity">
                  <div className="flex flex-wrap gap-1.5">
                    {SEVERITIES.map(s => <Chip key={s} active={severity === s} onClick={() => setSeverity(s)}>{s}</Chip>)}
                  </div>
                </Field>
              </div>

              {progress && (
                <div className="rounded-xl border border-line bg-bg-900/60 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{running ? 'Processing alerts…' : 'Ready'}</span>
                    <span className="font-mono text-brand-300">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-150" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <Stat label="Generated" value={progress.generated} color="text-white" />
                    <Stat label="Duplicates" value={progress.duplicates} color="text-slate-300" />
                    <Stat label="Grouped" value={progress.grouped} color="text-brand-300" />
                    <Stat label="Suppressed" value={progress.suppressed} color="text-amber-300" />
                    <Stat label="Delivered" value={progress.delivered} color="text-emerald-300" />
                  </div>
                </div>
              )}

              <button onClick={start} disabled={running} className="btn-primary w-full justify-center py-3 text-base">
                {running ? <><Loader2 className="h-5 w-5 animate-spin" /> Simulating…</> : <><Play className="h-5 w-5" /> Start Simulation</>}
              </button>
            </>
          )}

          {done && progress && (
            <div className="animate-fade-in space-y-6 py-2">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-sm text-slate-400">Simulation complete</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {formatNum(progress.generated)} repetitive alerts consolidated into 1 actionable incident.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <BigNum label="ALERTS" value={progress.generated} color="text-rose-300" />
                <div className="flex flex-col items-center text-brand-400">
                  <ArrowDown className="h-6 w-6 animate-bounce" />
                  <span className="mt-1 rounded-md bg-bg-700 px-2 py-0.5 text-[10px] font-bold tracking-widest text-brand-300">ALERTPULSE</span>
                </div>
                <BigNum label="INCIDENT" value={1} color="text-emerald-300" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Duplicates Detected" value={progress.duplicates} color="text-slate-300" />
                <Stat label="Grouped" value={progress.grouped} color="text-brand-300" />
                <Stat label="Suppressed" value={progress.suppressed} color="text-amber-300" />
                <Stat label="Delivered" value={progress.delivered} color="text-emerald-300" />
              </div>

              <div className="flex gap-3">
                <button onClick={close} className="btn-primary flex-1 justify-center">View Results</button>
                <button onClick={() => { setDone(false); setProgress(null); }} className="btn-outline flex-1 justify-center">Run Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
        active ? 'border-brand-500 bg-brand-500/15 text-brand-200' : 'border-line bg-bg-800 text-slate-400 hover:border-bg-600 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-bg-800/80 p-2.5 text-center border border-line">
      <p className={`font-mono text-lg font-bold ${color}`}>{formatNum(value)}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function BigNum({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-4xl font-extrabold ${color} sm:text-5xl`}>{formatNum(value)}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
