import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type {
  DatabaseProbe,
  IHealthRepository,
} from './repositories/HealthRepository.js';

class StubHealthRepository implements IHealthRepository {
  public constructor(private readonly probe: DatabaseProbe) {}

  public async checkDatabase(): Promise<DatabaseProbe> {
    return this.probe;
  }
}

describe('Phase 1 API foundation', () => {
  it('returns a healthy response when PostgreSQL is connected', async () => {
    const app = createApp({
      healthRepository: new StubHealthRepository({
        connected: true,
        responseTimeMs: 2.5,
        serverTime: '2026-09-19T00:00:00.000Z',
      }),
    });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'hms-api',
      database: { status: 'connected', responseTimeMs: 2.5 },
    });
  });

  it('returns 503 when PostgreSQL is unavailable', async () => {
    const app = createApp({
      healthRepository: new StubHealthRepository({
        connected: false,
        responseTimeMs: 5,
      }),
    });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.database.status).toBe('disconnected');
  });

  it('returns a structured 404 response', async () => {
    const app = createApp({
      healthRepository: new StubHealthRepository({
        connected: true,
        responseTimeMs: 1,
      }),
    });

    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
