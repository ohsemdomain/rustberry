-- Migration number: 0001 	 2025-06-01T06:06:04.459Z

-- Items table
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    item_category INTEGER NOT NULL CHECK (item_category IN (1, 2, 3)), -- 1=Packaging, 2=Label, 3=Other (define in constants)
    item_price_cents INTEGER NOT NULL,
    item_description TEXT,
    item_status INTEGER DEFAULT 1 CHECK (item_status IN (0, 1)), -- 0=inactive, 1=active (define in constants)
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL
);

CREATE INDEX idx_items_status ON items(item_status);