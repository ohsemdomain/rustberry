-- Migration number: 0003      2025-06-01T12:00:00.000Z

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    contact_company_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)), -- 0=inactive, 1=active
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL
);

CREATE INDEX idx_customers_company ON customers(contact_company_name);
CREATE INDEX idx_customers_contact ON customers(contact_name);
CREATE INDEX idx_customers_phone ON customers(contact_phone);
CREATE INDEX idx_customers_email ON customers(contact_email);