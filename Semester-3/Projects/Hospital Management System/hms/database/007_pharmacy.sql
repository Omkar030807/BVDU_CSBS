BEGIN;
CREATE SEQUENCE IF NOT EXISTS medicine_number_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE IF NOT EXISTS medicines (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 medicine_id VARCHAR(20) NOT NULL UNIQUE DEFAULT ('MED-'||LPAD(NEXTVAL('medicine_number_seq')::TEXT,6,'0')),
 name VARCHAR(160) NOT NULL,
 category VARCHAR(100) NOT NULL,
 manufacturer VARCHAR(160) NOT NULL,
 quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity>=0),
 unit_price NUMERIC(12,2) NOT NULL CHECK(unit_price>=0),
 expiry_date DATE NOT NULL,
 low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK(low_stock_threshold>=0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 deleted_at TIMESTAMPTZ,
 CONSTRAINT medicines_name_not_blank CHECK(BTRIM(name)<>''),
 CONSTRAINT medicines_category_not_blank CHECK(BTRIM(category)<>''),
 CONSTRAINT medicines_manufacturer_not_blank CHECK(BTRIM(manufacturer)<>'')
);
CREATE UNIQUE INDEX IF NOT EXISTS medicines_active_identity_unique_idx ON medicines(LOWER(name),LOWER(manufacturer),expiry_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS medicines_search_idx ON medicines(LOWER(name),LOWER(category),LOWER(manufacturer)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS medicines_expiry_idx ON medicines(expiry_date) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS medicine_stock_movements(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 medicine_id UUID NOT NULL REFERENCES medicines(id),
 quantity_change INTEGER NOT NULL CHECK(quantity_change<>0),
 previous_quantity INTEGER NOT NULL CHECK(previous_quantity>=0),
 new_quantity INTEGER NOT NULL CHECK(new_quantity>=0),
 reason VARCHAR(300) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT stock_reason_not_blank CHECK(BTRIM(reason)<>'')
);
CREATE INDEX IF NOT EXISTS medicine_stock_movements_medicine_idx ON medicine_stock_movements(medicine_id,created_at DESC);
INSERT INTO schema_migrations(version) VALUES('007_pharmacy') ON CONFLICT DO NOTHING;
COMMIT;
