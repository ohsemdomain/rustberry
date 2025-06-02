-- Migration number: 0006      2025-06-01T12:03:00.000Z

CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    -- Snapshot of customer data at invoice time
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    -- Billing address snapshot
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_address_line3 TEXT,
    billing_address_line4 TEXT,
    billing_postcode TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_country TEXT,
    -- Shipping address snapshot  
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_address_line3 TEXT,
    shipping_address_line4 TEXT,
    shipping_postcode TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_country TEXT,
    invoice_date INTEGER NOT NULL DEFAULT (unixepoch()),
    status INTEGER DEFAULT 1 CHECK (status IN (1, 2, 3, 4)), 
    -- 1=unpaid, 2=partial, 3=paid, 4=cancelled
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_cents INTEGER NOT NULL DEFAULT 0,
    tax_percent INTEGER DEFAULT 0 CHECK (tax_percent >= 0),
    tax_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_name);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);