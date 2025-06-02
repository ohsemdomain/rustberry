-- Migration number: 0004      2025-06-01T12:01:00.000Z

CREATE TABLE customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    address_type TEXT NOT NULL CHECK (address_type IN ('billing', 'shipping')),
    address_label TEXT, -- e.g., "Main Office", "Warehouse 1", "Home"
    address_line1 TEXT,
    address_line2 TEXT,
    address_line3 TEXT,
    address_line4 TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    is_default INTEGER DEFAULT 0 CHECK (is_default IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_type ON customer_addresses(customer_id, address_type);