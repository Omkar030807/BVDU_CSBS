const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:5173/api';
const password = process.env.HMS_TEST_PASSWORD;

if (!password) {
  console.error('HMS_TEST_PASSWORD is required and must match the runtime seed password.');
  process.exit(1);
}

const accounts = [
  { role: 'Admin', email: 'admin@medicore.test', permissions: 10 },
  { role: 'Doctor', email: 'doctor@medicore.test', permissions: 4 },
  { role: 'Receptionist', email: 'reception@medicore.test', permissions: 5 },
];

const readJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const login = async ({ role, email, permissions }) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(response);
  if (response.status !== 200 || body?.user?.role !== role) {
    throw new Error(`${role} login failed with HTTP ${response.status}.`);
  }
  if (body.user.permissions.length !== permissions) {
    throw new Error(`${role} received an incorrect permission set.`);
  }
  const setCookie = response.headers.get('set-cookie');
  const cookie = setCookie?.split(';')[0];
  if (!cookie || !setCookie.includes('HttpOnly') || !setCookie.includes('SameSite=Strict')) {
    throw new Error(`${role} login did not issue the expected secure cookie.`);
  }
  return { body, cookie };
};

const run = async () => {
  const unauthenticated = await fetch(`${apiUrl}/auth/me`);
  if (unauthenticated.status !== 401) throw new Error('Unauthenticated session endpoint was not rejected.');

  const invalid = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: accounts[0].email, password: 'definitely-wrong' }),
  });
  if (invalid.status !== 401) throw new Error('Invalid credentials were not rejected.');

  const sessions = new Map();
  for (const account of accounts) {
    const session = await login(account);
    sessions.set(account.role, session.cookie);

    const me = await fetch(`${apiUrl}/auth/me`, { headers: { Cookie: session.cookie } });
    const meBody = await readJson(me);
    if (me.status !== 200 || meBody?.user?.email !== account.email) {
      throw new Error(`${account.role} session restoration failed.`);
    }
  }

  const adminCookie = sessions.get('Admin');
  const adminUsers = await fetch(`${apiUrl}/users`, { headers: { Cookie: adminCookie } });
  const adminUsersBody = await readJson(adminUsers);
  if (adminUsers.status !== 200 || adminUsersBody?.users?.length < 3) {
    throw new Error('Admin could not read database user accounts.');
  }
  if (adminUsersBody.users.some((user) => 'passwordHash' in user || 'password_hash' in user)) {
    throw new Error('A password hash was exposed by the users endpoint.');
  }

  for (const role of ['Doctor', 'Receptionist']) {
    const response = await fetch(`${apiUrl}/users`, { headers: { Cookie: sessions.get(role) } });
    const body = await readJson(response);
    if (response.status !== 403 || body?.error?.code !== 'FORBIDDEN') {
      throw new Error(`${role} was not blocked from Admin user management.`);
    }
  }

  const logout = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  if (logout.status !== 204) throw new Error('Logout did not return HTTP 204.');

  const replay = await fetch(`${apiUrl}/auth/me`, { headers: { Cookie: adminCookie } });
  const replayBody = await readJson(replay);
  if (replay.status !== 401 || replayBody?.error?.code !== 'INVALID_SESSION') {
    throw new Error('The logged-out JWT remained usable.');
  }

  console.log('Phase 2 smoke test passed: login, sessions, three roles, authorization, redaction, and logout invalidation are working.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
