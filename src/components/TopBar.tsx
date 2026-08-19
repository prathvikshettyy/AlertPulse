import { Activity, Bell, Search, ChevronDown, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';

export function TopBar() {
  const { metrics, isSimulating } = useStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-bg-900/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-300">Operational</span>
        </div>
        <div className="hidden items-center gap-2 rounded-lg bg-bg-700 px-2.5 py-1 md:flex">
          <Activity className={`h-3.5 w-3.5 ${isSimulating ? 'text-brand-400 animate-pulse' : 'text-brand-400'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isSimulating ? 'SIMULATION RUNNING' : 'LIVE PROCESSING'}
          </span>
        </div>
        <div className="hidden items-center gap-1.5 text-xs text-slate-500 lg:flex">
          <span>·</span>
          <span>{metrics.received.toLocaleString()} alerts ingested</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-bg-800 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            placeholder="Search alerts, incidents, fingerprints…"
            className="w-56 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
          />
          <kbd className="rounded bg-bg-700 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
        </div>
        <button className="relative rounded-lg border border-line bg-bg-800 p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-line bg-bg-800 px-2 py-1.5 hover:border-bg-600 transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-bg-900">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-white leading-none">Ops Engineer</p>
            <p className="text-[10px] text-slate-500 mt-0.5">on-call</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
