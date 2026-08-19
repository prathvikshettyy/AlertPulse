import { Boxes } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SeverityBadge, StatusBadge, FingerprintTag } from '@/components/Badges';
import { timeAgo } from '@/lib/hooks';

export function AlertGroupsPage() {
  const { groups } = useStore();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Alert Groups</h1>
        <p className="text-sm text-slate-500">Alerts grouped by fingerprint — each group is a candidate incident</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-850/60 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">Fingerprint</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Occurrences</th>
                <th className="px-4 py-3 font-medium">Instances</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {groups.map(g => (
                <tr key={g.fingerprint} className="hover:bg-bg-800/50 transition-colors">
                  <td className="px-4 py-3"><FingerprintTag fp={g.fingerprint} /></td>
                  <td className="px-4 py-3 text-slate-200">{g.title}</td>
                  <td className="px-4 py-3 text-slate-400">{g.service}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-white">{g.occurrences}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{g.instances}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={g.severity} size="xs" /></td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(g.lastSeen)}</td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500"><Boxes className="mx-auto mb-2 h-8 w-8 opacity-40" />No alert groups yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
