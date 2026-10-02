BEGIN;

CREATE SEQUENCE IF NOT EXISTS appointment_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id VARCHAR(20) NOT NULL UNIQUE
    DEFAULT ('APT-' || LPAD(NEXTVAL('appointment_number_seq')::TEXT, 6, '0')),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
    CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT appointments_reason_not_blank CHECK (BTRIM(reason) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_slot_unique_idx
  ON appointments (doctor_id, appointment_date, appointment_time)
  WHERE deleted_at IS NULL AND status = 'Scheduled';
CREATE INDEX IF NOT EXISTS appointments_date_idx
  ON appointments (appointment_date, appointment_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_patient_idx
  ON appointments (patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_doctor_idx
  ON appointments (doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_status_idx
  ON appointments (status) WHERE deleted_at IS NULL;

INSERT INTO schema_migrations (version)
VALUES ('005_appointments')
ON CONFLICT (version) DO NOTHING;

COMMIT;
