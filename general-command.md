# General D1 Database Commands

## Empty All Tables (Local Development)

To empty all data from your D1 tables while preserving the table structure, run these commands in order (respects foreign key constraints):

```bash
# Empty all tables
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM invoice_items;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM invoices;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM customer_contacts;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM customer_addresses;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM customers;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM users;"
bunx wrangler d1 execute rustyberry-d1 --local --command="DELETE FROM items;"
```

## Single Command to Empty All Tables

You can also run all DELETE commands in a single execution:

```bash
bunx wrangler d1 execute rustyberry-d1 --local --command="
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM customer_contacts;
DELETE FROM customer_addresses;
DELETE FROM customers;
DELETE FROM items;
"
```

## View Table Contents

To view data in specific tables:

```bash
# View all customers
bunx wrangler d1 execute rustyberry-d1 --local --command="SELECT * FROM customers;"
```

## Count Records

To check how many records are in each table:

```bash
bunx wrangler d1 execute rustyberry-d1 --local --command="
SELECT 'items' as table_name, COUNT(*) as count FROM items
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'customer_addresses', COUNT(*) FROM customer_addresses
UNION ALL
SELECT 'customer_contacts', COUNT(*) FROM customer_contacts
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items;
"
```

## Reset Database (Drop and Recreate)

To completely reset your local database:

```bash
# Drop the local database
rm -rf .wrangler/state/v3/d1/

# Re-run migrations
bunx wrangler d1 migrations apply rustyberry-d1 --local
```

## Create New Users

### Step 1: Generate Password Hash

First, generate a password hash for the new user:

```bash
bun run src/server/auth/hash-password.ts <password>

# Example:
bun run src/server/auth/hash-password.ts mySecurePassword123
```

This will output a password hash like:
```
passwordHash: 'HASH_STRING_HERE'
```

### Step 2: Create User in Database

Use the generated hash to create a new user. Replace the values as needed:

```bash
bunx wrangler d1 execute rustyberry-d1 --local --command="
INSERT INTO users (id, email, name, password_hash, role) 
VALUES ('user-3', 'newuser@company.com', 'New User Name', 'PASTE_HASH_HERE', 'sales');
"
```

### Available Roles

The system supports these roles:
- `admin` - Full system access
- `sales` - Sales department access
- `marketing` - Marketing department access
- `creative` - Creative department access
- `hr` - HR department access

### Example: Create Multiple Users

```bash
# Generate hashes first
bun run src/server/auth/hash-password.ts salespass123
bun run src/server/auth/hash-password.ts hrpass456

# Then insert users
bunx wrangler d1 execute rustyberry-d1 --local --command="
INSERT INTO users (id, email, name, password_hash, role) VALUES 
('user-sales-1', 'sales@company.com', 'Sales Manager', 'SALES_HASH_HERE', 'sales'),
('user-hr-1', 'hr@company.com', 'HR Manager', 'HR_HASH_HERE', 'hr');
"
```

### View All Users

```bash
bunx wrangler d1 execute rustyberry-d1 --local --command="
SELECT id, email, name, role, datetime(created_at, 'unixepoch') as created_date 
FROM users 
ORDER BY created_at DESC;
"
```

### Default Users

The migration includes two default users:
- **Admin**: `admin@company.com` (password: check migration file)
- **Marketing**: `marketing@company.com` (password: check migration file)

## Notes

- The `--local` flag ensures these commands only affect your local D1 database
- Remove `--local` to run commands against your remote D1 database (be careful!)
- The database name `rustyberry-d1` should match the name in your `wrangler.toml`
- Never commit plain text passwords to your repository