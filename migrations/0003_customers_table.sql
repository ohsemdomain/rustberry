-- Migration number: 0003      2025-06-01T12:00:00.000Z

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)), -- 0=inactive, 1=active
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL
);

CREATE INDEX idx_customers_name ON customers(customer_name);
CREATE INDEX idx_customers_email ON customers(customer_email);