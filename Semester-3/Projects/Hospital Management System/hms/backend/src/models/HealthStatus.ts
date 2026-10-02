export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  responseTimeMs: number;
  serverTime?: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  database: DatabaseHealth;
}
