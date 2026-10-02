import { createApp } from './app.js';
import { Database } from './config/database.js';
import { environment } from './config/environment.js';

const startServer = async (): Promise<void> => {
  const database = Database.getInstance();

  try {
    await database.verifyConnection();
    console.log('PostgreSQL connection verified.');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL. Check DATABASE_URL and ensure the server is running.');
    console.error(error);
    process.exitCode = 1;
    return;
  }

  const app = createApp();
  const server = app.listen(environment.PORT, '0.0.0.0', () => {
    console.log(`HMS API listening on http://0.0.0.0:${environment.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      void database.close().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

void startServer();
