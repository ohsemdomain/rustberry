import type { StoredUser } from './types'

// IMPORTANT: To add a new user:
// 1. Generate password hash using: bun run src/worker/auth/hash-password.ts
// 2. Add user to this object
// 3. Redeploy the app

export const users: Record<string, StoredUser> = {
	// Test user for development
	'user-1': {
		id: 'user-1',
		email: 'admin@company.com',
		name: 'Admin User',
		department: 'wildcard',
		createdAt: '2024-01-01T00:00:00Z',
		// Password: "testpass123" - CHANGE THIS IN PRODUCTION
		passwordHash:
			'1e9tkLJNxi4rK6lzRGQ/f3wLI9uYYdq4w196zZnH+Jw1/daoU7GawERKdnvfrYBz',
	},
	// Add more users here as needed
}

export function getUserByEmail(email: string): StoredUser | null {
	const normalizedEmail = email.toLowerCase()
	return (
		Object.values(users).find(
			(user) => user.email.toLowerCase() === normalizedEmail,
		) || null
	)
}

export function getUserById(userId: string): StoredUser | null {
	return users[userId] || null
}
