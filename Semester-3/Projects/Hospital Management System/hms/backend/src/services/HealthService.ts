import type { HealthStatus } from '../models/HealthStatus.js';
import type { IHealthRepository } from '../repositories/HealthRepository.js';

export class HealthService {
  public constructor(private readonly healthRepository: IHealthRepository) {}

  public async getHealth(): Promise<HealthStatus> {
    const databaseProbe = await this.healthRepository.checkDatabase();

    return {
      status: databaseProbe.connected ? 'ok' : 'degraded',
      service: 'hms-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: databaseProbe.connected ? 'connected' : 'disconnected',
        responseTimeMs: databaseProbe.responseTimeMs,
        ...(databaseProbe.serverTime ? { serverTime: databaseProbe.serverTime } : {}),
      },
    };
  }
}
