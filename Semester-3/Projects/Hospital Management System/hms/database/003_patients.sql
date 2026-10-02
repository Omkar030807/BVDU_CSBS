BEGIN;

CREATE SEQUENCE IF NOT EXISTS patient_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(20) NOT NULL UNIQUE
    DEFAULT ('PAT-' || LPAD(NEXTVAL('patient_number_seq')::TEXT, 6, '0')),
  full_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL
    CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  blood_group VARCHAR(10) NOT NULL DEFAULT 'Unknown'
    CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  emergency_contact VARCHAR(255) NOT NULL,
  reason_for_visit TEXT NOT NULL,
  medical_history TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT patients_full_name_not_blank CHECK (BTRIM(full_name) <> ''),
  CONSTRAINT patients_phone_not_blank CHECK (BTRIM(phone) <> ''),
  CONSTRAINT patients_address_not_blank CHECK (BTRIM(address) <> ''),
  CONSTRAINT patients_emergency_contact_not_blank CHECK (BTRIM(emergency_contact) <> ''),
  CONSTRAINT patients_reason_not_blank CHECK (BTRIM(reason_for_visit) <> ''),
  CONSTRAINT patients_dob_reasonable CHECK (date_of_birth >= DATE '1900-01-01'),
  CONSTRAINT patients_email_normalized CHECK (email IS NULL OR email = LOWER(BTRIM(email)))
);

CREATE INDEX IF NOT EXISTS patients_full_name_lower_idx ON patients (LOWER(full_name));
CREATE INDEX IF NOT EXISTS patients_phone_idx ON patients (phone);
CREATE INDEX IF NOT EXISTS patients_gender_idx ON patients (gender) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS patients_blood_group_idx ON patients (blood_group) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS patients_registration_date_idx
  ON patients (registration_date DESC) WHERE deleted_at IS NULL;

INSERT INTO schema_migrations (version)
VALUES ('003_patients')
ON CONFLICT (version) DO NOTHING;

COMMIT;
