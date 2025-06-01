import type { StoredUser, User } from '@/shared/types'
import type { D1Database } from '@cloudflare/workers-types'

export async function getUserByEmail(
	db: D1Database,
	email: string,
): Promise<StoredUser | null> {
	const result = await db
		.prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
		.bind(email.toLowerCase())
		.first<{
			id: string
			email: string
			name: string
			password_hash: string
			role: string
			created_at: number
		}>()

	if (!result) return null

	return {
		id: result.id,
		email: result.email,
		name: result.name,
		passwordHash: result.password_hash,
		role: result.role as StoredUser['role'],
		createdAt: new Date(result.created_at * 1000).toISOString(),
	}
}

export async function getUserById(
	db: D1Database,
	userId: string,
): Promise<StoredUser | null> {
	const result = await db
		.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
		.bind(userId)
		.first<{
			id: string
			email: string
			name: string
			password_hash: string
			role: string
			created_at: number
		}>()

	if (!result) return null

	return {
		id: result.id,
		email: result.email,
		name: result.name,
		passwordHash: result.password_hash,
		role: result.role as StoredUser['role'],
		createdAt: new Date(result.created_at * 1000).toISOString(),
	}
}

export async function createUser(
	db: D1Database,
	userData: {
		id: string
		email: string
		name: string
		passwordHash: string
		role: string
	},
): Promise<User> {
	await db
		.prepare(
			'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
		)
		.bind(
			userData.id,
			userData.email.toLowerCase(),
			userData.name,
			userData.passwordHash,
			userData.role,
		)
		.run()

	const storedUser = await getUserById(db, userData.id)
	if (!storedUser) throw new Error('Failed to create user')
	const { passwordHash, ...user } = storedUser
	return user
}
