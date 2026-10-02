# MediCore Hospital Management System

**Release:** v1.0.0 — all 12 delivery phases accepted.

A complete PostgreSQL-backed Hospital Management System built with React 19, TypeScript, Vite, Node.js, Express 5, and a protected REST API. Functional records, totals, alerts, and statistics come from PostgreSQL; the frontend does not contain fabricated operational data.

## Implemented phases

1. **Foundation** — responsive application shell, PostgreSQL pool, migrations, health checks, layered backend.
2. **Authentication and roles** — bcrypt passwords, HTTP-only JWT sessions, Admin/Doctor/Receptionist RBAC.
3. **Patients** — generated IDs, CRUD, search, filters, medical and contact details.
4. **Doctors** — profiles, departments, fees, rooms, and structured weekly availability.
5. **Appointments** — scheduling, statuses, notes, filters, and database-enforced double-booking prevention.
6. **Admissions and beds** — transactional allocation/discharge and automatic bed occupancy/release.
7. **Pharmacy** — medicine CRUD, transactional stock movements, low-stock and expiry alerts.
8. **Prescriptions** — structured multi-medicine prescriptions with dosage, frequency, duration, and instructions.
9. **Billing** — itemized invoices, discounts, tax, partial/full payments, balances, receipts, and printable details.
10. **Computational statistics** — live date-filtered aggregates, trends, CSV export, mean, median, mode, variance, and standard deviation.
11. **Notifications** — role-targeted operational alerts, unread state, dismissal, and automatic resolution.
12. **Release acceptance** — complete RBAC, route, migration, schema, password-hash, security-header, build, and live-workflow verification.

## Major safety rules

- Passwords are stored only as bcrypt hashes.
- Protected APIs require an active HTTP-only cookie session and server-side permission checks.
- Appointment slot conflicts are blocked by PostgreSQL.
- Bed admission and discharge use transactions and row locks.
- Occupied beds and patients with active admissions cannot be assigned again.
- Stock updates are transactional, audited, and cannot reduce quantity below zero.
- Expired or deleted medicines cannot be added to prescriptions.
- Invoice totals are calculated server-side from line items.
- Payments cannot exceed the outstanding balance.
- Paid bills cannot be edited, cancelled, or deleted.
- Operational notifications are derived from current database conditions.
- Statistical calculations are isolated in `StatisticsService`.

## Roles and permissions

| Module | Admin | Doctor | Receptionist |
|---|:---:|:---:|:---:|
| Patients | ✓ | ✓ | ✓ |
| Doctors | ✓ | — | — |
| Appointments | ✓ | ✓ | ✓ |
| Admissions & beds | ✓ | — | ✓ |
| Pharmacy | ✓ | — | — |
| Prescriptions | ✓ | ✓ | — |
| Billing | ✓ | — | ✓ |
| Statistics | ✓ | — | — |
| Notifications | ✓ | ✓ | ✓ |
| Users & roles | ✓ | — | — |

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- VS Code recommended

## Database setup

```sql
CREATE ROLE hms_user WITH LOGIN PASSWORD 'choose_a_database_password';
CREATE DATABASE hms_db OWNER hms_user;
```

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
openssl rand -hex 32
```

Set `DATABASE_URL` and the generated `JWT_SECRET` in `backend/.env`, then run:

```bash
npm install
npm run db:migrate
```

Ordered migrations:

- `001_foundation.sql`
- `002_authentication.sql`
- `003_patients.sql`
- `004_doctors.sql`
- `005_appointments.sql`
- `006_admissions_beds.sql`
- `007_pharmacy.sql`
- `008_prescriptions.sql`
- `009_billing.sql`
- `010_notifications.sql`

Migrations are idempotent and recorded in `schema_migrations`.

## Seed development users

```bash
SEED_DEFAULT_PASSWORD='ChooseYourStrongDevPassword!' npm run db:seed
```

PowerShell:

```powershell
$env:SEED_DEFAULT_PASSWORD='ChooseYourStrongDevPassword!'
npm run db:seed
```

Accounts:

- `admin@medicore.test`
- `doctor@medicore.test`
- `reception@medicore.test`

Current local acceptance password: `HmsPhase2@2026` — change it outside this development workspace.

## Run

```bash
npm run dev
```

Or separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Default URLs:

- Frontend: <http://localhost:5173>
- API: <http://localhost:4000/api>
- Health: <http://localhost:4000/api/health>
- Dashboard: <http://localhost:5173/dashboard>
- Patients: <http://localhost:5173/patients>
- Doctors: <http://localhost:5173/doctors>
- Appointments: <http://localhost:5173/appointments>
- Admissions: <http://localhost:5173/admissions>
- Pharmacy: <http://localhost:5173/pharmacy>
- Prescriptions: <http://localhost:5173/prescriptions>
- Billing: <http://localhost:5173/billing>
- Statistics: <http://localhost:5173/statistics>
- Notifications: <http://localhost:5173/notifications>

## Verification

Compile and automated tests:

```bash
npm run typecheck
npm run build
npm test
npm audit --omit=dev
```

Live PostgreSQL workflows:

```bash
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase2
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase3
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase4
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase5
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase6
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase7
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase8
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase9
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase10
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase11
HMS_TEST_PASSWORD='YourSeedPassword' npm run test:phase12
```

`test:phase12` and `test:acceptance` verify:

- v1.0 API metadata and live PostgreSQL health
- Helmet security headers and secure session cookies
- unauthenticated request rejection
- the complete three-role permission matrix
- all frontend module routes
- safe structured 404 responses without stack leakage
- all migrations and required tables
- bcrypt password hashes
- critical appointment, admission, and medicine indexes

## Main REST resources

All functional resources are protected by authentication and module permissions.

| Resource | Main routes |
|---|---|
| Authentication | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` |
| Users | `/api/users` |
| Patients | `/api/patients`, `/api/patients/:id` |
| Doctors | `/api/doctors`, `/api/doctors/:id` |
| Appointments | `/api/appointments`, `/api/appointments/options`, `/api/appointments/:id` |
| Beds | `/api/beds`, `/api/beds/:id` |
| Admissions | `/api/admissions`, `/api/admissions/options`, `/api/admissions/:id/discharge` |
| Medicines | `/api/medicines`, `/api/medicines/alerts`, `/api/medicines/:id/stock`, `/api/medicines/:id/movements` |
| Prescriptions | `/api/prescriptions`, `/api/prescriptions/options`, `/api/prescriptions/:id` |
| Billing | `/api/billing`, `/api/billing/options`, `/api/billing/:id/payments`, `/api/billing/:id/cancel` |
| Statistics | `/api/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD` |
| Notifications | `/api/notifications`, `/api/notifications/read-all`, `/api/notifications/:id/read`, `/api/notifications/:id/dismiss` |

## Architecture

```text
hms/
├── frontend/src/
│   ├── components/       # Layout, route guards, modal, domain forms
│   ├── context/          # Authentication provider
│   ├── hooks/            # Auth and health hooks
│   ├── pages/            # Dashboard and all module directories
│   ├── services/         # Typed REST clients
│   ├── types/            # Frontend domain contracts
│   └── App.tsx
├── backend/src/
│   ├── config/           # Environment and PostgreSQL singleton
│   ├── controllers/      # HTTP validation and responses
│   ├── middleware/       # Authentication, permissions, errors
│   ├── models/           # Domain interfaces
│   ├── repositories/     # Parameterized PostgreSQL persistence
│   ├── routes/           # Protected REST composition
│   ├── services/         # Domain and computational rules
│   ├── utils/            # Migrations, seeding, AppError
│   ├── app.ts
│   └── server.ts
├── database/             # Ordered migrations 001–010
├── tests/                # Phase smoke and final acceptance workflows
└── README.md
```

### OOP usage

- **Encapsulation:** validation, calculations, transactions, and persistence live in focused classes.
- **Abstraction:** services depend on repository, hashing, and token interfaces.
- **Polymorphism:** PostgreSQL and in-memory test repositories implement shared contracts.
- **Dependency injection:** repositories and services are composed in `backend/src/app.ts`.
- **Single responsibility:** controllers handle HTTP, services enforce rules, repositories execute parameterized SQL.

Inheritance is not forced where interfaces and composition are clearer.

## Production checklist

- Set `NODE_ENV=production`.
- Use a unique 32+ character `JWT_SECRET` and strong PostgreSQL credentials.
- Set `CORS_ORIGIN` to the exact HTTPS frontend origin.
- Terminate TLS at a trusted reverse proxy.
- Restrict database network access and use encrypted backups.
- Run migrations before starting the release.
- Replace all development account passwords.
- Configure process supervision, centralized logs, monitoring, and alerting.
- Run `npm run test:acceptance` against the release environment.

## Known limitations

- Prescribing does not reduce stock automatically; dispensing remains an explicit audited pharmacy stock action.
- Doctor login accounts are not linked one-to-one to doctor profile records.
- Doctor availability supports one continuous range per selected weekday.
- Soft-deleted record restoration and staff-attribution fields on every domain mutation are not implemented.
- PDF generation, insurance-provider integrations, email/SMS gateways, and payment-gateway settlement require external services.
- TLS, backups, process supervision, and CI/CD are deployment responsibilities rather than application mocks.
