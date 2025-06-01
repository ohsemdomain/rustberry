export type Department = 'wildcard' | 'sales' | 'marketing' | 'creative' | 'hr'

export type ResourceType = 'note' | 'task' | 'invoice' | 'items'

// Permission actions for each resource
export type PermissionAction =
	| 'create'
	| 'read'
	| 'update-own'
	| 'update-any'
	| 'delete-own'
	| 'delete-any'

// User permissions structure
export type UserPermissions = {
	[K in ResourceType]?: PermissionAction[]
}

export interface User {
	id: string
	email: string
	name: string
	department: Department
	createdAt: string
	permissions: UserPermissions
}

export interface StoredUser extends User {
	passwordHash: string
}

export interface JWTPayload {
	userId: string
	email: string
	department: Department
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	password: string
	name: string
	department: Department
}

// Helper type for owned resources
export interface OwnedResource {
	created_by: string
}
