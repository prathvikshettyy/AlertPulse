import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Alert, AlertGroup, CooldownConfig, Incident, ServiceInfo } from './types';
import {
  defaultCooldown, defaultServices, generateAlertBatch, buildIncidentFromAlerts,
  alertsToGroups, type GeneratedAlert, type GenOptions,
} from './simulation';

interface Metrics {
  received: number;
  filtered: number;
  delivered: number;
  activeIncidents: number;
  criticalIncidents: number;
}

interface VolumePoint {
  t: number;
  incoming: number;
  filtered: number;
  delivered: number;
}

interface Store {
  alerts: Alert[];
  incidents: Incident[];
  groups: AlertGroup[];
  services: ServiceInfo[];
  cooldown: CooldownConfig;
  metrics: Metrics;
  volume: VolumePoint[];
  lastSim: { total: number; duplicates: number; grouped: number; suppressed: number; delivered: number } | null;
  isSimulating: boolean;
  setCooldown: (c: CooldownConfig) => void;
  runSimulation: (opts: GenOptions, onProgress?: (p: { generated: number; duplicates: number; grouped: number; suppressed: number; delivered: number; incidentCreated: boolean }) => void) => Promise<void>;
  ackIncident: (id: number) => void;
  resolveIncident: (id: number) => void;
  escalateIncident: (id: number) => void;
  suppressIncident: (id: number) => void;
  addAlert: (a: Alert) => void;
}

const StoreCtx = createContext<Store | null>(null);

const BASE_RECEIVED = 12450;
const BASE_FILTERED = 10980;
const BASE_DELIVERED = 1470;

function seedAlerts(): Alert[] {
  const batch = generateAlertBatch({ type: 'Database Failure', count: 24, instances: 5, severity: 'CRITICAL' }, 0);
  return batch.map(({ isDuplicate, ...a }) => a).slice(0, 24);
}

function seedIncidents(): Incident[] {
  return [
    {
      id: 1041,
      title: 'API Gateway 503 Surge',
      fingerprint: 'API_503_72BC',
      severity: 'HIGH',
      occurrences: 87,
      affectedInstances: ['gw-01', 'gw-02', 'gw-03'],
      firstSeen: Date.now() - 1000 * 60 * 42,
      lastSeen: Date.now() - 1000 * 60 * 4,
      status: 'ACKNOWLEDGED',
      services: ['API Gateway'],
      timeline: [
        { t: Date.now() - 1000 * 60 * 42, label: 'First 503 detected' },
        { t: Date.now() - 1000 * 60 * 30, label: '12 events grouped' },
        { t: Date.now() - 1000 * 60 * 12, label: '87 occurrences' },
        { t: Date.now() - 1000 * 60 * 4, label: 'Acknowledged by on-call' },
      ],
    },
    {
      id: 1040,
      title: 'Auth Service Latency',
      fingerprint: 'AUTH_LAT_44A2',
      severity: 'MEDIUM',
      occurrences: 41,
      affectedInstances: ['auth-01', 'auth-02'],
      firstSeen: Date.now() - 1000 * 60 * 90,
      lastSeen: Date.now() - 1000 * 60 * 15,
      status: 'INVESTIGATING',
      services: ['Authentication Service'],
      timeline: [
        { t: Date.now() - 1000 * 60 * 90, label: 'Latency spike detected' },
        { t: Date.now() - 1000 * 60 * 60, label: '41 occurrences grouped' },
      ],
    },
  ];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents);
  const [services] = useState<ServiceInfo[]>(defaultServices);
  const [cooldown, setCooldown] = useState<CooldownConfig>(defaultCooldown);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSim, setLastSim] = useState<Store['lastSim']>(null);
  const [baseReceived, setBaseReceived] = useState(BASE_RECEIVED);
  const [baseFiltered, setBaseFiltered] = useState(BASE_FILTERED);
  const [baseDelivered, setBaseDelivered] = useState(BASE_DELIVERED);
  const [extraReceived, setExtraReceived] = useState(0);
  const [extraFiltered, setExtraFiltered] = useState(0);
  const [extraDelivered, setExtraDelivered] = useState(0);
  const [volume, setVolume] = useState<VolumePoint[]>(() => {
    const pts: VolumePoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const t = now - i * 60_000;
      const incoming = 30 + Math.round(Math.random() * 60);
      const filtered = Math.round(incoming * (0.78 + Math.random() * 0.12));
      const delivered = incoming - filtered;
      pts.push({ t, incoming, filtered, delivered });
    }
    return pts;
  });

  const groups = alertsToGroups(alerts);
  const metrics: Metrics = {
    received: baseReceived + extraReceived,
    filtered: baseFiltered + extraFiltered,
    delivered: baseDelivered + extraDelivered,
    activeIncidents: incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'SUPPRESSED').length,
    criticalIncidents: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
  };

  // Ambient live updates
  const tick = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      tick.current++;
      const inc = 2 + Math.floor(Math.random() * 6);
      setExtraReceived(r => r + inc);
      setExtraFiltered(f => f + Math.round(inc * 0.88));
      setExtraDelivered(d => d + Math.max(0, inc - Math.round(inc * 0.88)));
      setVolume(v => {
        const last = v[v.length - 1];
        const np: VolumePoint = {
          t: Date.now(),
          incoming: last.incoming + Math.round((Math.random() - 0.5) * 20),
          filtered: 0,
          delivered: 0,
        };
        np.incoming = Math.max(10, np.incoming);
        np.filtered = Math.round(np.incoming * 0.88);
        np.delivered = np.incoming - np.filtered;
        return [...v.slice(-29), np];
      });
      if (tick.current % 3 === 0) {
        const svc = ['Payment Service', 'API Gateway', 'User Service', 'Database Service'][Math.floor(Math.random() * 4)];
        const sev = (['LOW', 'MEDIUM', 'HIGH'] as const)[Math.floor(Math.random() * 3)];
        const fps = ['DB_TIMEOUT_8F21', 'CPU_SPIKE_91A2', 'API_503_72BC', 'MEM_HIGH_33F1'];
        const a: Alert = {
          id: `ALT-${Date.now()}`,
          timestamp: Date.now(),
          service: svc,
          instance: `srv-${Math.floor(Math.random() * 9) + 1}`,
          error: 'Periodic health check warning',
          severity: sev,
          endpoint: '/health',
          stackTrace: 'HealthCheck: degraded response time',
          fingerprint: fps[Math.floor(Math.random() * fps.length)],
          action: 'SUPPRESSED',
          status: 'Cooldown',
        };
        setAlerts(prev => [a, ...prev].slice(0, 200));
      }
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const runSimulation = useCallback(async (opts: GenOptions, onProgress?: (p: { generated: number; duplicates: number; grouped: number; suppressed: number; delivered: number; incidentCreated: boolean }) => void) => {
    setIsSimulating(true);
    const all = generateAlertBatch(opts, 0);
    const total = all.length;
    const duplicates = all.filter(a => a.isDuplicate).length;
    const grouped = Math.max(1, Math.round(total * 0.05));
    const suppressed = duplicates;
    const delivered = 1;

    const stepSize = Math.max(1, Math.floor(total / 40));
    let generated = 0, dup = 0, grp = 0, sup = 0;
    const newAlerts: Alert[] = [];

    for (let i = 0; i < total; i += stepSize) {
      const slice = all.slice(i, i + stepSize);
      newAlerts.push(...slice.map(({ isDuplicate, ...a }) => a));
      generated = newAlerts.length;
      dup = newAlerts.filter((_, idx) => all[idx]?.isDuplicate).length;
      sup = dup;
      grp = Math.max(1, Math.round(generated * 0.05));
      setAlerts(prev => [...slice.map(({ isDuplicate, ...a }) => a), ...prev].slice(0, 300));
      onProgress?.({ generated, duplicates: dup, grouped: grp, suppressed: sup, delivered: 0, incidentCreated: false });
      await new Promise(r => setTimeout(r, 80));
    }

    // Build incident from the batch
    const incident = buildIncidentFromAlerts(all);
    setIncidents(prev => [incident, ...prev]);
    setExtraReceived(r => r + total);
    setExtraFiltered(f => f + suppressed);
    setExtraDelivered(d => d + delivered);
    setLastSim({ total, duplicates, grouped, suppressed, delivered });
    onProgress?.({ generated: total, duplicates, grouped, suppressed, delivered, incidentCreated: true });
    setIsSimulating(false);
  }, []);

  const ackIncident = useCallback((id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'ACKNOWLEDGED' } : i));
  }, []);
  const resolveIncident = useCallback((id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'RESOLVED' } : i));
  }, []);
  const escalateIncident = useCallback((id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'ESCALATED', severity: 'CRITICAL' } : i));
  }, []);
  const suppressIncident = useCallback((id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'SUPPRESSED' } : i));
  }, []);
  const addAlert = useCallback((a: Alert) => setAlerts(prev => [a, ...prev].slice(0, 300)), []);

  void baseReceived; void baseFiltered; void baseDelivered;

  const value: Store = {
    alerts, incidents, groups, services, cooldown, metrics, volume,
    lastSim, isSimulating,
    setCooldown, runSimulation, ackIncident, resolveIncident, escalateIncident, suppressIncident, addAlert,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
