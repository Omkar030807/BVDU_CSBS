import pg from 'pg';
import { environment } from './environment.js';

const { Pool } = pg;

/**
 * Encapsulates the PostgreSQL connection pool behind one application-wide
 * instance. Repositories receive the pool through this class rather than
 * creating connections themselves.
 */
export class Database {
  private static instance: Database | undefined;
  private readonly pool: pg.Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: environment.DATABASE_URL,
      ssl: environment.DB_SSL ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.pool.on('error', (error) => {
      console.error('Unexpected idle PostgreSQL client error:', error);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  public getPool(): pg.Pool {
    return this.pool;
  }

  public async verifyConnection(): Promise<void> {
    await this.pool.query('SELECT 1 AS connected');
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
