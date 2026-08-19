export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertAction = 'GROUPED' | 'SUPPRESSED' | 'ESCALATED' | 'DELIVERED' | 'MONITORED';
export type AlertStatus = 'Active' | 'Cooldown' | 'Resolved' | 'Investigating';
export type IncidentStatus = 'INVESTIGATING' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED' | 'SUPPRESSED';

export interface Alert {
  id: string;
  timestamp: number;
  service: string;
  instance: string;
  error: string;
  severity: Severity;
  endpoint: string;
  stackTrace: string;
  fingerprint: string;
  action: AlertAction;
  status: AlertStatus;
}

export interface Incident {
  id: number;
  title: string;
  fingerprint: string;
  severity: Severity;
  occurrences: number;
  affectedInstances: string[];
  firstSeen: number;
  lastSeen: number;
  status: IncidentStatus;
  services: string[];
  timeline: { t: number; label: string }[];
}

export interface AlertGroup {
  fingerprint: string;
  title: string;
  service: string;
  occurrences: number;
  instances: number;
  severity: Severity;
  status: 'Active' | 'Monitoring' | 'Cooldown' | 'Resolved';
  lastSeen: number;
}

export interface ServiceInfo {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Down';
  alertCount: number;
  activeIncidents: number;
  errorRate: number;
}

export interface CooldownConfig {
  severity: Record<Severity, number>;
  frequency: { range: string; min: number; max: number; action: AlertAction }[];
}

export interface SimResult {
  total: number;
  duplicates: number;
  grouped: number;
  suppressed: number;
  delivered: number;
  incidentCreated: boolean;
}

export type SimType = 'Database Failure' | 'CPU Spike' | 'API Failure' | 'Memory Spike' | 'Custom Error';
