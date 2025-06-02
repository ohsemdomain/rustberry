export type UserRole = 'admin' | 'sales' | 'marketing' | 'creative' | 'hr'

export type ResourceType = 'note' | 'task' | 'invoices' | 'items' | 'customers'

// Permission actions for each resource
export type PermissionAction =
	| 'create'
	| 'read'
	| 'update-own'
	| 'update-any'
	| 'delete-own'
	| 'delete-any'

export interface User {
	id: string
	email: string
	name: string
	role: UserRole
	createdAt: string
}

export interface StoredUser extends User {
	passwordHash: string
}

export interface JWTPayload {
	userId: string
	email: string
	role: UserRole
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	password: string
	name: string
	role: UserRole
}

// Helper type for owned resources
export interface OwnedResource {
	created_by: string
}

// Role-based permissions mapping
export const rolePermissions: Record<
	UserRole,
	{
		items?: Array<
			| 'create'
			| 'read'
			| 'update-own'
			| 'update-any'
			| 'delete-own'
			| 'delete-any'
		>
		note?: Array<
			| 'create'
			| 'read'
			| 'update-own'
			| 'update-any'
			| 'delete-own'
			| 'delete-any'
		>
		task?: Array<
			| 'create'
			| 'read'
			| 'update-own'
			| 'update-any'
			| 'delete-own'
			| 'delete-any'
		>
		invoices?: Array<
			| 'create'
			| 'read'
			| 'update-own'
			| 'update-any'
			| 'delete-own'
			| 'delete-any'
		>
		customers?: Array<
			| 'create'
			| 'read'
			| 'update-own'
			| 'update-any'
			| 'delete-own'
			| 'delete-any'
		>
	}
> = {
	admin: {
		items: ['create', 'read', 'update-any', 'delete-any'],
		note: ['create', 'read', 'update-any', 'delete-any'],
		task: ['create', 'read', 'update-any', 'delete-any'],
		invoices: ['create', 'read', 'update-any', 'delete-any'],
		customers: ['create', 'read', 'update-any', 'delete-any'],
	},
	marketing: {
		items: ['read'],
		note: ['create', 'read', 'update-own', 'delete-own'],
		task: ['create', 'read', 'update-own'],
		invoices: [],
		customers: [],
	},
	sales: {
		items: ['create', 'read', 'update-own', 'delete-own'],
		note: ['create', 'read', 'update-own', 'delete-own'],
		task: ['create', 'read', 'update-any', 'delete-any'],
		invoices: ['create', 'read', 'update-own'],
		customers: ['create', 'read', 'update-own'],
	},
	creative: {
		items: ['create', 'read', 'update-own', 'delete-own'],
		note: ['create', 'read', 'update-own', 'delete-own'],
		task: ['create', 'read', 'update-own', 'delete-own'],
		invoices: [],
		customers: [],
	},
	hr: {
		items: ['read'],
		note: ['create', 'read', 'update-any', 'delete-any'],
		task: ['create', 'read', 'update-any', 'delete-any'],
		invoices: [],
		customers: [],
	},
}
