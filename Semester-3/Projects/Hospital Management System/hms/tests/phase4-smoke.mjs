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
  const unauthenticated = await fetch(`${apiUrl}/doctors`);
  if (unauthenticated.status !== 401) throw new Error('Unauthenticated doctor access was not rejected.');

  const admin = await login('admin@medicore.test');
  const doctorUser = await login('doctor@medicore.test');
  const receptionist = await login('reception@medicore.test');

  for (const session of [doctorUser, receptionist]) {
    const denied = await request('/doctors', session.cookie);
    if (denied.response.status !== 403 || denied.body?.error?.code !== 'FORBIDDEN') {
      throw new Error(`${session.user.role} was not denied Doctor Management.`);
    }
  }

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const name = `Dr. Phase Four ${unique}`;
  const payload = {
    name,
    specialization: `Workflow Specialty ${unique}`,
    department: `Workflow Department ${unique}`,
    phone: '+91 90000 44444',
    email: `phase4-${unique}@example.test`,
    room: 'WF-401',
    consultationFee: 875.5,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
    ],
  };

  let created;
  try {
    const create = await request('/doctors', admin.cookie, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (create.response.status !== 201) {
      throw new Error(`Doctor creation failed with HTTP ${create.response.status}: ${JSON.stringify(create.body)}`);
    }
    created = create.body.doctor;
    if (!/^DOC-\d{6}$/.test(created.doctorId) || created.consultationFee !== payload.consultationFee) {
      throw new Error('Created doctor identity or fee is invalid.');
    }

    for (const identifier of [created.id, created.doctorId]) {
      const read = await request(`/doctors/${identifier}`, admin.cookie);
      if (read.response.status !== 200 || read.body.doctor.id !== created.id) {
        throw new Error(`Doctor read failed for identifier ${identifier}.`);
      }
    }

    const update = await request(`/doctors/${created.id}`, admin.cookie, {
      method: 'PATCH',
      body: JSON.stringify({ room: 'WF-402', consultationFee: 925 }),
    });
    if (update.response.status !== 200 || update.body.doctor.room !== 'WF-402') {
      throw new Error('Doctor update failed.');
    }
    if (
      update.body.doctor.email !== payload.email ||
      update.body.doctor.availability.length !== payload.availability.length
    ) {
      throw new Error('Partial doctor update reset fields that were not supplied.');
    }

    const query = new URLSearchParams({
      search: name,
      specialization: payload.specialization,
      department: payload.department,
      availableDay: 'Monday',
      minFee: '925',
      maxFee: '925',
    });
    const search = await request(`/doctors?${query}`, admin.cookie);
    if (search.response.status !== 200 || !search.body.doctors.some((doctor) => doctor.id === created.id)) {
      throw new Error('Doctor search/filter did not return the created database record.');
    }
    if (
      !search.body.filterOptions.specializations.includes(payload.specialization) ||
      !search.body.filterOptions.departments.includes(payload.department)
    ) {
      throw new Error('Doctor filter options were not computed from database records.');
    }

    const invalidSchedule = await request(`/doctors/${created.id}`, admin.cookie, {
      method: 'PATCH',
      body: JSON.stringify({
        availability: [{ day: 'Tuesday', startTime: '17:00', endTime: '09:00' }],
      }),
    });
    if (invalidSchedule.response.status !== 400) {
      throw new Error('Invalid doctor availability was not rejected.');
    }

    const remove = await request(`/doctors/${created.id}`, admin.cookie, { method: 'DELETE' });
    if (remove.response.status !== 204) throw new Error('Doctor deletion failed.');

    const deletedRead = await request(`/doctors/${created.id}`, admin.cookie);
    if (deletedRead.response.status !== 404 || deletedRead.body?.error?.code !== 'DOCTOR_NOT_FOUND') {
      throw new Error('Deleted doctor remained accessible.');
    }
    created = null;
  } finally {
    if (created?.id) await request(`/doctors/${created.id}`, admin.cookie, { method: 'DELETE' });
  }

  console.log('Phase 4 smoke test passed: protected PostgreSQL doctor CRUD, schedules, search/filter, role denial, validation, and deletion are working.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
