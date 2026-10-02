import { SignJWT, jwtVerify } from 'jose';
import type { AuthTokenClaims } from '../models/AuthSession.js';
import { isUserRole, type UserRecord } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export interface ITokenService {
  create(user: UserRecord): Promise<string>;
  verify(token: string): Promise<AuthTokenClaims>;
}

export class JwtTokenService implements ITokenService {
  private readonly secretKey: Uint8Array;

  public constructor(
    secret: string,
    private readonly sessionHours: number,
  ) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  public async create(user: UserRecord): Promise<string> {
    return new SignJWT({
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(user.id)
      .setIssuer('hms-api')
      .setAudience('hms-web')
      .setIssuedAt()
      .setExpirationTime(`${this.sessionHours}h`)
      .sign(this.secretKey);
  }

  public async verify(token: string): Promise<AuthTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: ['HS256'],
        issuer: 'hms-api',
        audience: 'hms-web',
      });

      if (
        !payload.sub ||
        typeof payload.email !== 'string' ||
        !isUserRole(payload.role) ||
        typeof payload.sessionVersion !== 'number'
      ) {
        throw new Error('Token payload is incomplete.');
      }

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        sessionVersion: payload.sessionVersion,
      };
    } catch {
      throw new AppError(401, 'INVALID_SESSION', 'Your session is invalid or has expired.');
    }
  }
}
