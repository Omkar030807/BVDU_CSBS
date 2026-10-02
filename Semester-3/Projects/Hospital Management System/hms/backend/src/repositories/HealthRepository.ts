import type pg from 'pg';

export interface DatabaseProbe {
  connected: boolean;
  responseTimeMs: number;
  serverTime?: string;
}

export interface IHealthRepository {
  checkDatabase(): Promise<DatabaseProbe>;
}

export class PostgreSQLHealthRepository implements IHealthRepository {
  public constructor(private readonly pool: pg.Pool) {}

  public async checkDatabase(): Promise<DatabaseProbe> {
    const startedAt = performance.now();

    try {
      const result = await this.pool.query<{ server_time: Date }>(
        'SELECT CURRENT_TIMESTAMP AS server_time',
      );
      const serverTime = result.rows[0]?.server_time;

      return {
        connected: true,
        responseTimeMs: Math.round((performance.now() - startedAt) * 100) / 100,
        serverTime: serverTime?.toISOString(),
      };
    } catch {
      return {
        connected: false,
        responseTimeMs: Math.round((performance.now() - startedAt) * 100) / 100,
      };
    }
  }
}
