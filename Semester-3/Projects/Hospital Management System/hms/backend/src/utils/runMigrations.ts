import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from '../config/database.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = resolve(currentDirectory, '../../../database');

const runMigrations = async (): Promise<void> => {
  const database = Database.getInstance();

  try {
    await database.verifyConnection();
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const migrationFile of migrationFiles) {
      const sql = await readFile(resolve(migrationsDirectory, migrationFile), 'utf8');
      await database.getPool().query(sql);
      console.log(`Applied migration: ${migrationFile}`);
    }

    console.log('Database migrations completed successfully.');
  } finally {
    await database.close();
  }
};

runMigrations().catch((error: unknown) => {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
});
