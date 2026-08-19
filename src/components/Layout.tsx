import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Sidebar, type PageId } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ active, onNavigate, children }: { active: PageId; onNavigate: (id: PageId) => void; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-bg-900">
      <Sidebar active={active} onNavigate={onNavigate} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar active={active} onNavigate={(id) => { onNavigate(id); setMobileOpen(false); }} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-lg bg-bg-700 p-1.5 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-line bg-bg-900/90 px-4 backdrop-blur-md md:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg border border-line bg-bg-800 p-2 text-slate-300">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
              <Zap className="h-4 w-4 text-bg-900" />
            </div>
            <span className="font-extrabold text-white">AlertPulse</span>
          </div>
        </div>
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
