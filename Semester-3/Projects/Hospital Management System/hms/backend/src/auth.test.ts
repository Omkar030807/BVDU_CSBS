import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { UserRecord } from './models/User.js';
import type {
  DatabaseProbe,
  IHealthRepository,
} from './repositories/HealthRepository.js';
import type { IUserRepository } from './repositories/UserRepository.js';
import type { IPasswordHasher } from './services/PasswordService.js';
import type { ITokenService } from './services/TokenService.js';
import type { AuthTokenClaims } from './models/AuthSession.js';

const now = '2026-09-19T10:00:00.000Z';
const initialUsers: UserRecord[] = [
  {
    id: 'admin-id',
    fullName: 'System Administrator',
    email: 'admin@test.local',
    role: 'Admin',
    passwordHash: 'hash:CorrectPassword1!',
    isActive: true,
    sessionVersion: 1,
    lastLoginAt: null,
    createdAt: now,
  },
  {
    id: 'doctor-id',
    fullName: 'Test Doctor',
    email: 'doctor@test.local',
    role: 'Doctor',
    passwordHash: 'hash:CorrectPassword1!',
    isActive: true,
    sessionVersion: 1,
    lastLoginAt: null,
    createdAt: now,
  },
];

class StubHealthRepository implements IHealthRepository {
  public async checkDatabase(): Promise<DatabaseProbe> {
    return { connected: true, responseTimeMs: 1, serverTime: now };
  }
}

class InMemoryUserRepository implements IUserRepository {
  private readonly users = initialUsers.map((user) => ({ ...user }));

  public async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  public async findById(id: string): Promise<UserRecord | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  public async updateLastLogin(id: string): Promise<UserRecord> {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) throw new Error('Missing test user.');
    user.lastLoginAt = now;
    return user;
  }

  public async incrementSessionVersion(id: string): Promise<void> {
    const user = this.users.find((candidate) => candidate.id === id);
    if (user) user.sessionVersion += 1;
  }

  public async list(): Promise<UserRecord[]> {
    return this.users;
  }
}

class StubPasswordHasher implements IPasswordHasher {
  public async hash(password: string): Promise<string> {
    return `hash:${password}`;
  }

  public async verify(password: string, passwordHash: string): Promise<boolean> {
    return passwordHash === `hash:${password}`;
  }
}

class StubTokenService implements ITokenService {
  public async create(user: UserRecord): Promise<string> {
    return `${user.id}:${user.sessionVersion}:${user.role}:${user.email}`;
  }

  public async verify(token: string): Promise<AuthTokenClaims> {
    const [userId, version, role, email] = token.split(':');
    if (!userId || !version || !email || !['Admin', 'Doctor', 'Receptionist'].includes(role ?? '')) {
      throw new Error('Invalid test token.');
    }
    return {
      userId,
      sessionVersion: Number(version),
      role: role as AuthTokenClaims['role'],
      email,
    };
  }
}

const buildApp = () =>
  createApp({
    healthRepository: new StubHealthRepository(),
    userRepository: new InMemoryUserRepository(),
    passwordHasher: new StubPasswordHasher(),
    tokenService: new StubTokenService(),
  });

describe('Phase 2 authentication and authorization', () => {
  it('logs in and issues an HTTP-only strict cookie without exposing password data', async () => {
    const response = await request(buildApp()).post('/api/auth/login').send({
      email: 'ADMIN@test.local',
      password: 'CorrectPassword1!',
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ role: 'Admin', email: 'admin@test.local' });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(response.headers['set-cookie']?.[0]).toContain('SameSite=Strict');
  });

  it('restores a valid session and invalidates the token on logout', async () => {
    const app = buildApp();
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/login').send({
      email: 'admin@test.local',
      password: 'CorrectPassword1!',
    });
    const originalCookie = login.headers['set-cookie']?.[0]?.split(';')[0];

    expect((await agent.get('/api/auth/me')).status).toBe(200);
    expect((await agent.post('/api/auth/logout')).status).toBe(204);
    expect((await agent.get('/api/auth/me')).status).toBe(401);

    const replay = await request(app).get('/api/auth/me').set('Cookie', originalCookie ?? '');
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('INVALID_SESSION');
  });

  it('allows Admin and rejects Doctor on the user-management route', async () => {
    const app = buildApp();
    const admin = request.agent(app);
    const doctor = request.agent(app);

    await admin.post('/api/auth/login').send({ email: 'admin@test.local', password: 'CorrectPassword1!' });
    await doctor.post('/api/auth/login').send({ email: 'doctor@test.local', password: 'CorrectPassword1!' });

    const adminResponse = await admin.get('/api/users');
    const doctorResponse = await doctor.get('/api/users');

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.users).toHaveLength(2);
    expect(adminResponse.body.users[0].passwordHash).toBeUndefined();
    expect(doctorResponse.status).toBe(403);
    expect(doctorResponse.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects invalid credentials with a generic response', async () => {
    const response = await request(buildApp()).post('/api/auth/login').send({
      email: 'admin@test.local',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.',
    });
  });
});
