BEGIN;

CREATE SEQUENCE IF NOT EXISTS doctor_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id VARCHAR(20) NOT NULL UNIQUE
    DEFAULT ('DOC-' || LPAD(NEXTVAL('doctor_number_seq')::TEXT, 6, '0')),
  name VARCHAR(120) NOT NULL,
  specialization VARCHAR(120) NOT NULL,
  department VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  room VARCHAR(50) NOT NULL,
  consultation_fee NUMERIC(10, 2) NOT NULL CHECK (consultation_fee >= 0),
  availability JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT doctors_name_not_blank CHECK (BTRIM(name) <> ''),
  CONSTRAINT doctors_specialization_not_blank CHECK (BTRIM(specialization) <> ''),
  CONSTRAINT doctors_department_not_blank CHECK (BTRIM(department) <> ''),
  CONSTRAINT doctors_phone_not_blank CHECK (BTRIM(phone) <> ''),
  CONSTRAINT doctors_email_normalized CHECK (email = LOWER(BTRIM(email))),
  CONSTRAINT doctors_room_not_blank CHECK (BTRIM(room) <> ''),
  CONSTRAINT doctors_availability_array CHECK (JSONB_TYPEOF(availability) = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS doctors_email_unique_lower_idx ON doctors (LOWER(email));
CREATE INDEX IF NOT EXISTS doctors_name_lower_idx ON doctors (LOWER(name));
CREATE INDEX IF NOT EXISTS doctors_specialization_lower_idx
  ON doctors (LOWER(specialization)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS doctors_department_lower_idx
  ON doctors (LOWER(department)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS doctors_created_at_idx
  ON doctors (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS doctors_availability_gin_idx ON doctors USING GIN (availability);

INSERT INTO schema_migrations (version)
VALUES ('004_doctors')
ON CONFLICT (version) DO NOTHING;

COMMIT;
