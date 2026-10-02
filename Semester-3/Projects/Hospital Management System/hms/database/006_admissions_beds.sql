BEGIN;

CREATE SEQUENCE IF NOT EXISTS admission_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number VARCHAR(30) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('General', 'ICU', 'Private', 'Semi-Private', 'Emergency')),
  status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
  current_patient_id UUID REFERENCES patients(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  UNIQUE (ward, bed_number),
  CONSTRAINT beds_number_not_blank CHECK (BTRIM(bed_number) <> ''),
  CONSTRAINT beds_ward_not_blank CHECK (BTRIM(ward) <> ''),
  CONSTRAINT beds_state_consistent CHECK (
    (status = 'Occupied' AND current_patient_id IS NOT NULL) OR
    (status IN ('Available', 'Maintenance') AND current_patient_id IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id VARCHAR(20) NOT NULL UNIQUE
    DEFAULT ('ADM-' || LPAD(NEXTVAL('admission_number_seq')::TEXT, 6, '0')),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  bed_id UUID NOT NULL REFERENCES beds(id),
  ward VARCHAR(100) NOT NULL,
  admission_date DATE NOT NULL,
  expected_discharge DATE,
  discharge_date TIMESTAMPTZ,
  diagnosis TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Admitted' CHECK (status IN ('Admitted', 'Discharged', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT admissions_diagnosis_not_blank CHECK (BTRIM(diagnosis) <> ''),
  CONSTRAINT admissions_expected_after_admission CHECK (expected_discharge IS NULL OR expected_discharge >= admission_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS admissions_active_bed_unique_idx
  ON admissions (bed_id) WHERE deleted_at IS NULL AND status = 'Admitted';
CREATE UNIQUE INDEX IF NOT EXISTS admissions_active_patient_unique_idx
  ON admissions (patient_id) WHERE deleted_at IS NULL AND status = 'Admitted';
CREATE INDEX IF NOT EXISTS beds_status_ward_idx ON beds (status, ward) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS admissions_status_idx ON admissions (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS admissions_patient_idx ON admissions (patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS admissions_doctor_idx ON admissions (doctor_id) WHERE deleted_at IS NULL;

INSERT INTO schema_migrations (version) VALUES ('006_admissions_beds') ON CONFLICT DO NOTHING;
COMMIT;
