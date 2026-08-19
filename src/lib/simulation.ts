import type {
  Alert, AlertAction, AlertGroup, Incident, ServiceInfo,
  Severity, CooldownConfig, SimType,
} from './types';

const SERVICES = ['Payment Service', 'API Gateway', 'User Service', 'Database Service', 'Authentication Service', 'Notification Service'];

const TEMPLATES: Record<SimType, { error: string; service: string; fp: string; severity: Severity; endpoint: string; stack: string }> = {
  'Database Failure': {
    error: 'Database connection timeout',
    service: 'Payment Service',
    fp: 'DB_TIMEOUT_8F21',
    severity: 'CRITICAL',
    endpoint: '/api/v1/checkout',
    stack: 'psycopg.OperationalError: server closed the connection unexpectedly',
  },
  'CPU Spike': {
    error: 'CPU usage exceeded 90% threshold',
    service: 'User Service',
    fp: 'CPU_SPIKE_91A2',
    severity: 'HIGH',
    endpoint: '/api/v1/profile',
    stack: 'SystemMonitor: load_avg=18.4 cpu=94.2% cores=8',
  },
  'API Failure': {
    error: '503 Service Unavailable',
    service: 'API Gateway',
    fp: 'API_503_72BC',
    severity: 'CRITICAL',
    endpoint: '/api/v1/*',
    stack: 'GatewayError: upstream timeout after 30000ms',
  },
  'Memory Spike': {
    error: 'Memory threshold exceeded 85%',
    service: 'Notification Service',
    fp: 'MEM_HIGH_33F1',
    severity: 'HIGH',
    endpoint: '/api/v1/notify',
    stack: 'MemoryMonitor: heap=6.8GB limit=8GB oom_score=842',
  },
  'Custom Error': {
    error: 'Unhandled application exception',
    service: 'Authentication Service',
    fp: 'APP_ERR_00AB',
    severity: 'MEDIUM',
    endpoint: '/api/v1/auth',
    stack: 'RuntimeError: unexpected token at json.parse:42',
  },
};

const IP_POOL = ['10.0.1.21', '10.0.1.34', '10.0.1.47', '10.0.1.52', '10.0.1.68', '10.0.1.77'];
const REQ_POOL = ['78231', '78289', '78312', '78401', '78455', '78502', '78588', '78614'];

let alertSeq = 100000;
let incidentSeq = 1041;

export const nowTime = () => Date.now();

export function makeInstance(prefix: string, i: number): string {
  const n = String(i).padStart(2, '0');
  return `${prefix}-${n}`;
}

export function defaultCooldown(): CooldownConfig {
  return {
    severity: { LOW: 60, MEDIUM: 30, HIGH: 15, CRITICAL: 0 },
    frequency: [
      { range: '1–10 alerts', min: 1, max: 10, action: 'MONITORED' },
      { range: '10–50 alerts', min: 10, max: 50, action: 'GROUPED' },
      { range: '50–200 alerts', min: 50, max: 200, action: 'SUPPRESSED' },
      { range: '200+ alerts', min: 200, max: 10000, action: 'ESCALATED' },
    ],
  };
}

function fingerprintFor(template: { fp: string }, variant: number): string {
  if (variant === 0) return template.fp;
  // Small variants share the same fingerprint (similarity detection)
  if (variant < 4) return template.fp;
  return template.fp.slice(0, -2) + variant.toString(16).padStart(2, '0').toUpperCase().slice(-2);
}

export interface GenOptions {
  type: SimType;
  count: number;
  instances: number;
  severity: Severity;
}

export interface GeneratedAlert extends Alert {
  isDuplicate: boolean;
}

export function generateAlertBatch(opts: GenOptions, startIndex = 0): GeneratedAlert[] {
  const template = TEMPLATES[opts.type];
  const out: GeneratedAlert[] = [];
  const prefix = template.service.split(' ')[0].toLowerCase().slice(0, 4);
  for (let i = 0; i < opts.count; i++) {
    const idx = startIndex + i;
    const variant = Math.floor(Math.random() * 6);
    const instance = makeInstance(prefix === 'paym' ? 'server' : prefix === 'api ' ? 'gw' : prefix === 'user' ? 'srv' : prefix === 'data' ? 'db' : prefix === 'auth' ? 'auth' : 'notif', (idx % opts.instances) + 1);
    const isDup = variant < 4;
    const severity = Math.random() < 0.15 ? opts.severity : ((['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Severity[])[Math.min(3, Math.floor(Math.random() * 4))]);
    const action: AlertAction = isDup ? 'SUPPRESSED' : (Math.random() < 0.5 ? 'GROUPED' : 'ESCALATED');
    out.push({
      id: `ALT-${alertSeq++}`,
      timestamp: nowTime() - (opts.count - idx) * 100,
      service: template.service,
      instance,
      error: template.error,
      severity,
      endpoint: template.endpoint,
      stackTrace: template.stack,
      fingerprint: fingerprintFor(template, variant),
      action,
      status: action === 'SUPPRESSED' ? 'Cooldown' : 'Active',
      isDuplicate: isDup,
    });
    void IP_POOL; void REQ_POOL;
  }
  return out;
}

export function buildIncidentFromAlerts(alerts: GeneratedAlert[]): Incident {
  const fp = alerts[0].fingerprint;
  const instances = Array.from(new Set(alerts.map(a => a.instance)));
  const services = Array.from(new Set(alerts.map(a => a.service)));
  const first = alerts[0].timestamp;
  const last = alerts[alerts.length - 1].timestamp;
  const severity = alerts.find(a => a.severity === 'CRITICAL')?.severity || alerts.find(a => a.severity === 'HIGH')?.severity || 'MEDIUM';
  return {
    id: ++incidentSeq,
    title: alerts[0].error.replace(/exceeded.*$/i, 'Threshold Exceeded').replace('connection timeout', 'Connection Failure'),
    fingerprint: fp,
    severity,
    occurrences: alerts.length,
    affectedInstances: instances,
    firstSeen: first,
    lastSeen: last,
    status: 'INVESTIGATING',
    services,
    timeline: buildTimeline(alerts),
  };
}

function buildTimeline(alerts: GeneratedAlert[]): { t: number; label: string }[] {
  const n = alerts.length;
  const first = alerts[0].timestamp;
  const milestones = [0, 0.05, 0.25, 0.5, 0.75, 1];
  const labels = [
    'First error detected',
    `${Math.round(n * 0.05)} similar events grouped`,
    `${Math.round(n * 0.25)} occurrences`,
    `${Math.round(n * 0.5)} occurrences`,
    `${Math.round(n * 0.75)} occurrences`,
    `${n} occurrences — incident escalated`,
  ];
  return milestones.map((m, i) => ({ t: first + m * (alerts[n - 1].timestamp - first), label: labels[i] }));
}

export function alertsToGroups(alerts: Alert[]): AlertGroup[] {
  const map = new Map<string, Alert[]>();
  for (const a of alerts) {
    const arr = map.get(a.fingerprint) || [];
    arr.push(a);
    map.set(a.fingerprint, arr);
  }
  return Array.from(map.entries()).map(([fp, arr]) => ({
    fingerprint: fp,
    title: arr[0].error,
    service: arr[0].service,
    occurrences: arr.length,
    instances: new Set(arr.map(a => a.instance)).size,
    severity: arr.find(a => a.severity === 'CRITICAL')?.severity || arr[0].severity,
    status: 'Active' as const,
    lastSeen: arr[arr.length - 1].timestamp,
  })).sort((a, b) => b.occurrences - a.occurrences);
}

export const defaultServices = (): ServiceInfo[] => [
  { name: 'Payment Service', status: 'Degraded', alertCount: 142, activeIncidents: 1, errorRate: 0.4 },
  { name: 'API Gateway', status: 'Healthy', alertCount: 87, activeIncidents: 0, errorRate: 0.1 },
  { name: 'User Service', status: 'Healthy', alertCount: 54, activeIncidents: 0, errorRate: 0.05 },
  { name: 'Database Service', status: 'Degraded', alertCount: 312, activeIncidents: 2, errorRate: 0.8 },
  { name: 'Authentication Service', status: 'Healthy', alertCount: 23, activeIncidents: 0, errorRate: 0.02 },
  { name: 'Notification Service', status: 'Healthy', alertCount: 38, activeIncidents: 0, errorRate: 0.1 },
];

export const SEVERITY_COLORS: Record<Severity, { text: string; bg: string; border: string; dot: string }> = {
  LOW: { text: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/30', dot: 'bg-sky-400' },
  MEDIUM: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  HIGH: { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  CRITICAL: { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400' },
};

export const ACTION_COLORS: Record<AlertAction, string> = {
  GROUPED: 'text-brand-300 bg-brand-500/10',
  SUPPRESSED: 'text-slate-400 bg-slate-600/20',
  ESCALATED: 'text-rose-300 bg-rose-500/10',
  DELIVERED: 'text-emerald-300 bg-emerald-500/10',
  MONITORED: 'text-sky-300 bg-sky-500/10',
};

export { SERVICES };
