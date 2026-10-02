BEGIN;
CREATE SEQUENCE IF NOT EXISTS prescription_number_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE IF NOT EXISTS prescriptions(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 prescription_id VARCHAR(20) NOT NULL UNIQUE DEFAULT ('PRX-'||LPAD(NEXTVAL('prescription_number_seq')::TEXT,6,'0')),
 patient_id UUID NOT NULL REFERENCES patients(id),
 doctor_id UUID NOT NULL REFERENCES doctors(id),
 prescription_date DATE NOT NULL,
 diagnosis TEXT NOT NULL,
 general_instructions TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 deleted_at TIMESTAMPTZ,
 CONSTRAINT prescriptions_diagnosis_not_blank CHECK(BTRIM(diagnosis)<>'')
);
CREATE TABLE IF NOT EXISTS prescription_items(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
 medicine_id UUID NOT NULL REFERENCES medicines(id),
 dosage VARCHAR(120) NOT NULL,
 frequency VARCHAR(120) NOT NULL,
 duration VARCHAR(120) NOT NULL,
 instructions VARCHAR(500),
 position INTEGER NOT NULL DEFAULT 0 CHECK(position>=0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT prescription_items_dosage_not_blank CHECK(BTRIM(dosage)<>''),
 CONSTRAINT prescription_items_frequency_not_blank CHECK(BTRIM(frequency)<>''),
 CONSTRAINT prescription_items_duration_not_blank CHECK(BTRIM(duration)<>''),
 UNIQUE(prescription_id,medicine_id)
);
CREATE INDEX IF NOT EXISTS prescriptions_patient_idx ON prescriptions(patient_id,prescription_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS prescriptions_doctor_idx ON prescriptions(doctor_id,prescription_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS prescriptions_date_idx ON prescriptions(prescription_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS prescription_items_medicine_idx ON prescription_items(medicine_id);
INSERT INTO schema_migrations(version) VALUES('008_prescriptions') ON CONFLICT DO NOTHING;
COMMIT;
