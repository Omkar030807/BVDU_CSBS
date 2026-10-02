import type { UserRole } from './User.js';

export interface AuthTokenClaims {
  userId: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
}
