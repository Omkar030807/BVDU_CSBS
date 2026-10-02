import { Database } from '../config/database.js';
import type { UserRole } from '../models/User.js';
import { BcryptPasswordHasher } from '../services/PasswordService.js';

interface SeedAccount {
  fullName: string;
  email: string;
  role: UserRole;
}

const accounts: SeedAccount[] = [
  { fullName: 'System Administrator', email: 'admin@medicore.test', role: 'Admin' },
  { fullName: 'Dr. Test User', email: 'doctor@medicore.test', role: 'Doctor' },
  { fullName: 'Reception Test User', email: 'reception@medicore.test', role: 'Receptionist' },
];

const validatePassword = (password: string | undefined): string => {
  if (!password) {
    throw new Error('SEED_DEFAULT_PASSWORD is required. It is never written to project files.');
  }
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error('SEED_DEFAULT_PASSWORD must be 12+ characters with upper, lower, number, and symbol.');
  }
  return password;
};

const seedUsers = async (): Promise<void> => {
  const password = validatePassword(process.env.SEED_DEFAULT_PASSWORD);
  const database = Database.getInstance();
  const hasher = new BcryptPasswordHasher(12);
  const client = await database.getPool().connect();

  try {
    await client.query('BEGIN');

    for (const account of accounts) {
      const passwordHash = await hasher.hash(password);
      const existing = await client.query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [account.email],
      );

      if (existing.rows[0]) {
        await client.query(
          `UPDATE users
           SET full_name = $1, role = $2, password_hash = $3, is_active = TRUE,
               session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [account.fullName, account.role, passwordHash, existing.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO users (full_name, email, role, password_hash)
           VALUES ($1, $2, $3, $4)`,
          [account.fullName, account.email, account.role, passwordHash],
        );
      }

      console.log(`Seeded ${account.role}: ${account.email}`);
    }

    await client.query('COMMIT');
    console.log('Authentication users seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await database.close();
  }
};

seedUsers().catch((error: unknown) => {
  console.error('User seed failed:', error);
  process.exitCode = 1;
});
