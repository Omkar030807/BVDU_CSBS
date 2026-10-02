BEGIN;
CREATE SEQUENCE IF NOT EXISTS bill_number_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE IF NOT EXISTS bills(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 bill_id VARCHAR(20) NOT NULL UNIQUE DEFAULT ('BIL-'||LPAD(NEXTVAL('bill_number_seq')::TEXT,6,'0')),
 patient_id UUID NOT NULL REFERENCES patients(id),
 invoice_date DATE NOT NULL,
 due_date DATE NOT NULL,
 discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK(discount_percent BETWEEN 0 AND 100),
 tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK(tax_percent BETWEEN 0 AND 100),
 subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(subtotal>=0),
 discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(discount_amount>=0),
 tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(tax_amount>=0),
 total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(total>=0),
 paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(paid_amount>=0),
 balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(balance>=0),
 status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK(status IN('Pending','Partial','Paid','Cancelled')),
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 deleted_at TIMESTAMPTZ,
 CONSTRAINT bills_dates_valid CHECK(due_date>=invoice_date),
 CONSTRAINT bills_payment_valid CHECK(paid_amount<=total),
 CONSTRAINT bills_balance_valid CHECK(balance=total-paid_amount)
);
CREATE TABLE IF NOT EXISTS bill_items(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
 description VARCHAR(300) NOT NULL,
 category VARCHAR(60) NOT NULL CHECK(category IN('Consultation','Medicine','Laboratory','Procedure','Room','Other')),
 quantity NUMERIC(10,2) NOT NULL CHECK(quantity>0),
 unit_price NUMERIC(12,2) NOT NULL CHECK(unit_price>=0),
 line_total NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(quantity*unit_price,2)) STORED,
 position INTEGER NOT NULL DEFAULT 0 CHECK(position>=0),
 CONSTRAINT bill_items_description_not_blank CHECK(BTRIM(description)<>'')
);
CREATE TABLE IF NOT EXISTS bill_payments(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 payment_id VARCHAR(20) NOT NULL UNIQUE DEFAULT ('PAY-'||LPAD(NEXTVAL('payment_number_seq')::TEXT,6,'0')),
 bill_id UUID NOT NULL REFERENCES bills(id),
 amount NUMERIC(12,2) NOT NULL CHECK(amount>0),
 method VARCHAR(30) NOT NULL CHECK(method IN('Cash','Card','UPI','Bank Transfer','Insurance')),
 reference VARCHAR(160),
 notes VARCHAR(500),
 payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS bills_patient_idx ON bills(patient_id,invoice_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bills_status_due_idx ON bills(status,due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bill_items_bill_idx ON bill_items(bill_id,position);
CREATE INDEX IF NOT EXISTS bill_payments_bill_idx ON bill_payments(bill_id,payment_date DESC);
INSERT INTO schema_migrations(version) VALUES('009_billing') ON CONFLICT DO NOTHING;
COMMIT;
