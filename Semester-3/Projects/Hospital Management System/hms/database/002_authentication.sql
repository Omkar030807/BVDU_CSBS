BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Receptionist')),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  session_version INTEGER NOT NULL DEFAULT 1 CHECK (session_version > 0),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_full_name_not_blank CHECK (BTRIM(full_name) <> ''),
  CONSTRAINT users_email_normalized CHECK (email = LOWER(BTRIM(email)))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_lower_idx
  ON users (LOWER(email));

CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_active_idx ON users (is_active) WHERE is_active = TRUE;

INSERT INTO schema_migrations (version)
VALUES ('002_authentication')
ON CONFLICT (version) DO NOTHING;

COMMIT;
