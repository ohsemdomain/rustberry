-- Migration number: 0005      2025-06-01T12:02:00.000Z

CREATE TABLE customer_contacts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    is_primary INTEGER DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_contacts_customer ON customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_phone ON customer_contacts(contact_phone);