BEGIN;
CREATE TABLE IF NOT EXISTS operational_notifications(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 notification_key VARCHAR(180) NOT NULL UNIQUE,
 title VARCHAR(180) NOT NULL,
 message VARCHAR(600) NOT NULL,
 category VARCHAR(30) NOT NULL CHECK(category IN('Appointments','Admissions','Pharmacy','Billing','System')),
 severity VARCHAR(20) NOT NULL CHECK(severity IN('Info','Warning','Critical')),
 source_type VARCHAR(40) NOT NULL,
 source_id UUID NOT NULL,
 target_roles TEXT[] NOT NULL,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 first_detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT notification_roles_valid CHECK(target_roles<@ARRAY['Admin','Doctor','Receptionist']::TEXT[])
);
CREATE TABLE IF NOT EXISTS notification_user_states(
 notification_id UUID NOT NULL REFERENCES operational_notifications(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 read_at TIMESTAMPTZ,
 dismissed_at TIMESTAMPTZ,
 PRIMARY KEY(notification_id,user_id)
);
CREATE INDEX IF NOT EXISTS operational_notifications_active_idx ON operational_notifications(is_active,severity,updated_at DESC);
CREATE INDEX IF NOT EXISTS notification_user_states_user_idx ON notification_user_states(user_id,read_at,dismissed_at);
INSERT INTO schema_migrations(version) VALUES('010_notifications') ON CONFLICT DO NOTHING;
COMMIT;
