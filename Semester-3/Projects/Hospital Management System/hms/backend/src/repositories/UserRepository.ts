import type pg from 'pg';
import type { UserRecord } from '../models/User.js';

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRecord['role'];
  password_hash: string;
  is_active: boolean;
  session_version: number;
  last_login_at: Date | null;
  created_at: Date;
}

const USER_COLUMNS = `
  id, full_name, email, role, password_hash, is_active,
  session_version, last_login_at, created_at
`;

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  passwordHash: row.password_hash,
  isActive: row.is_active,
  sessionVersion: row.session_version,
  lastLoginAt: row.last_login_at?.toISOString() ?? null,
  createdAt: row.created_at.toISOString(),
});

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  updateLastLogin(id: string): Promise<UserRecord>;
  incrementSessionVersion(id: string): Promise<void>;
  list(): Promise<UserRecord[]>;
}

export class PostgreSQLUserRepository implements IUserRepository {
  public constructor(private readonly pool: pg.Pool) {}

  public async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    const row = result.rows[0];
    return row ? mapUserRow(row) : null;
  }

  public async findById(id: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapUserRow(row) : null;
  }

  public async updateLastLogin(id: string): Promise<UserRecord> {
    const result = await this.pool.query<UserRow>(
      `UPDATE users
       SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('User disappeared while updating last login.');
    }
    return mapUserRow(row);
  }

  public async incrementSessionVersion(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE users
       SET session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id],
    );
  }

  public async list(): Promise<UserRecord[]> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users ORDER BY full_name ASC`,
    );
    return result.rows.map(mapUserRow);
  }
}
