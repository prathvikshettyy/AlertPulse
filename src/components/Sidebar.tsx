import {
  LayoutDashboard, Radio, AlertTriangle, Boxes, Gauge,
  Server, BarChart3, Settings, Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type PageId =
  | 'overview' | 'alerts' | 'incidents' | 'groups'
  | 'cooldown' | 'services' | 'analytics' | 'notifications' | 'settings';

const NAV: { id: PageId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'alerts', label: 'Live Alerts', icon: Radio },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'groups', label: 'Alert Groups', icon: Boxes },
  { id: 'cooldown', label: 'Cooldown Matrix', icon: Gauge },
  { id: 'services', label: 'Services', icon: Server },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

import { Bell } from 'lucide-react';

export function Sidebar({ active, onNavigate }: { active: PageId; onNavigate: (id: PageId) => void }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-bg-850 md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
          <Zap className="h-5 w-5 text-bg-900" />
        </div>
        <div>
          <p className="text-base font-extrabold tracking-tight text-white leading-none">AlertPulse</p>
          <p className="mt-1 text-[10px] text-slate-500 leading-none">intelligent alert middleware</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Monitor</p>
        {NAV.slice(0, 7).map(item => (
          <NavBtn key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} />
        ))}
        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">System</p>
        {NAV.slice(7).map(item => (
          <NavBtn key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} />
        ))}
      </nav>

      <div className="border-t border-line p-4">
        <div className="rounded-lg bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-500/20 p-3">
          <p className="text-xs font-semibold text-white">Less Noise.</p>
          <p className="text-xs font-semibold text-white">Faster Detection.</p>
          <p className="mt-1 text-xs font-semibold text-brand-300">Better Decisions.</p>
        </div>
      </div>
    </aside>
  );
}

function NavBtn({ item, active, onClick }: { item: { id: PageId; label: string; icon: ComponentType<{ className?: string }> }; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
    </button>
  );
}
