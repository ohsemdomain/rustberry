-- Migration number: 0008      2025-06-05T00:00:00.000Z

-- Remove contact fields from customers table since they're now in customer_contacts table
-- Keep only contact_company_name as it's company-level information

-- First, drop the indexes that reference the columns we're removing
DROP INDEX IF EXISTS idx_customers_contact;
DROP INDEX IF EXISTS idx_customers_phone;
DROP INDEX IF EXISTS idx_customers_email;

-- Create a new customers table without the contact fields
CREATE TABLE customers_new (
    id TEXT PRIMARY KEY,
    contact_company_name TEXT NOT NULL,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)), -- 0=inactive, 1=active
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL
);

-- Copy data from old table to new table (excluding contact fields)
INSERT INTO customers_new (id, contact_company_name, status, created_at, updated_at, created_by, updated_by)
SELECT id, contact_company_name, status, created_at, updated_at, created_by, updated_by
FROM customers;

-- Drop the old table
DROP TABLE customers;

-- Rename the new table
ALTER TABLE customers_new RENAME TO customers;

-- Recreate the company name index
CREATE INDEX idx_customers_company ON customers(contact_company_name);