const frontendUrl = process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173';
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

const requireOk = async (name, url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${name} failed: ${url} returned HTTP ${response.status}`);
  }
  return response;
};

const run = async () => {
  for (const route of ['/', '/login', '/dashboard']) {
    const response = await requireOk(`Frontend route ${route}`, `${frontendUrl}${route}`);
    const html = await response.text();
    if (!html.includes('<title>MediCore HMS</title>')) {
      throw new Error(`Frontend route ${route} did not return the HMS application.`);
    }
  }

  const directHealth = await requireOk('Direct API health', `${backendUrl}/api/health`);
  const directPayload = await directHealth.json();
  if (directPayload.status !== 'ok' || directPayload.database?.status !== 'connected') {
    throw new Error('Direct API health did not report a connected PostgreSQL database.');
  }

  const proxiedHealth = await requireOk('Proxied API health', `${frontendUrl}/api/health`);
  const proxiedPayload = await proxiedHealth.json();
  if (proxiedPayload.database?.status !== 'connected') {
    throw new Error('Frontend proxy health did not report a connected PostgreSQL database.');
  }

  console.log('Phase 1 smoke test passed: frontend routes, API, proxy, and PostgreSQL are healthy.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
