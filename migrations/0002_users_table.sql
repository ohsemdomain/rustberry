-- Create users table
CREATE TABLE users (
	id TEXT PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'marketing', 'creative', 'hr')),
	created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Migrate existing users from hardcoded users.ts
-- Admin user (was 'wildcard' department, now 'admin' role)
INSERT INTO users (id, email, name, password_hash, role) VALUES 
	('user-1', 'admin@company.com', 'Admin User', '1e9tkLJNxi4rK6lzRGQ/f3wLI9uYYdq4w196zZnH+Jw1/daoU7GawERKdnvfrYBz', 'admin');

-- Marketing user (maintains same role)
INSERT INTO users (id, email, name, password_hash, role) VALUES 
	('user-2', 'marketing@company.com', 'john_marketing', 'X2AW2DEOP11os3mgAtxhTzaEI3UqmVJTk8rWj0o7uFxwqt32QiLL9iT/bf2P2N7n', 'marketing');