const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:5173/api';
const password = process.env.HMS_TEST_PASSWORD;

if (!password) {
  console.error('HMS_TEST_PASSWORD is required and must match the seeded development password.');
  process.exit(1);
}

const readJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const login = async (email) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(response);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (response.status !== 200 || !cookie) throw new Error(`Login failed for ${email}.`);
  return { cookie, user: body.user };
};

const request = async (path, cookie, init = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Cookie: cookie,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  return { response, body: await readJson(response) };
};

const run = async () => {
  const unauthenticated = await fetch(`${apiUrl}/patients`);
  if (unauthenticated.status !== 401) throw new Error('Unauthenticated patient access was not rejected.');

  const admin = await login('admin@medicore.test');
  const doctor = await login('doctor@medicore.test');
  const receptionist = await login('reception@medicore.test');

  for (const session of [doctor, receptionist]) {
    const { response } = await request('/patients?limit=1', session.cookie);
    if (response.status !== 200) throw new Error(`${session.user.role} could not access authorized patient records.`);
  }

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const fullName = `Phase Three ${unique}`;
  const payload = {
    fullName,
    dateOfBirth: '1994-08-20',
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 90000 11111',
    email: `phase3-${unique}@example.test`,
    address: 'Automated Phase 3 Test Address, Pune',
    emergencyContact: 'Workflow Contact +91 98888 11111',
    reasonForVisit: 'Automated patient workflow verification',
    medicalHistory: 'No known conditions in automated verification.',
  };

  let created;
  try {
    const create = await request('/patients', admin.cookie, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (create.response.status !== 201) {
      throw new Error(`Patient creation failed with HTTP ${create.response.status}: ${JSON.stringify(create.body)}`);
    }
    created = create.body.patient;
    if (!/^PAT-\d{6}$/.test(created.patientId) || created.dateOfBirth !== payload.dateOfBirth) {
      throw new Error('Created patient identity or DOB format is invalid.');
    }

    for (const identifier of [created.id, created.patientId]) {
      const read = await request(`/patients/${identifier}`, admin.cookie);
      if (read.response.status !== 200 || read.body.patient.id !== created.id) {
        throw new Error(`Patient read failed for identifier ${identifier}.`);
      }
    }

    const update = await request(`/patients/${created.id}`, admin.cookie, {
      method: 'PATCH',
      body: JSON.stringify({ phone: '+91 90000 22222', reasonForVisit: 'Updated workflow verification' }),
    });
    if (update.response.status !== 200 || update.body.patient.phone !== '+91 90000 22222') {
      throw new Error('Patient update failed.');
    }
    if (update.body.patient.bloodGroup !== payload.bloodGroup || update.body.patient.email !== payload.email) {
      throw new Error('Partial update reset fields that were not supplied.');
    }

    const query = new URLSearchParams({
      search: fullName,
      gender: payload.gender,
      bloodGroup: payload.bloodGroup,
      minAge: String(created.age),
      maxAge: String(created.age),
    });
    const search = await request(`/patients?${query}`, admin.cookie);
    if (search.response.status !== 200 || !search.body.patients.some((patient) => patient.id === created.id)) {
      throw new Error('Patient search/filter did not return the created database record.');
    }

    const remove = await request(`/patients/${created.id}`, admin.cookie, { method: 'DELETE' });
    if (remove.response.status !== 204) throw new Error('Patient deletion failed.');

    const deletedRead = await request(`/patients/${created.id}`, admin.cookie);
    if (deletedRead.response.status !== 404 || deletedRead.body?.error?.code !== 'PATIENT_NOT_FOUND') {
      throw new Error('Deleted patient remained accessible.');
    }
    created = null;
  } finally {
    if (created?.id) {
      await request(`/patients/${created.id}`, admin.cookie, { method: 'DELETE' });
    }
  }

  console.log('Phase 3 smoke test passed: protected database create, read, update, search/filter, and delete workflows are working for authorized roles.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
