export type Department = 'wildcard' | 'sales' | 'marketing' | 'creative' | 'hr'

export type ResourceType = 'note' | 'task' | 'invoice' | 'items'

export interface User {
	id: string
	email: string
	name: string
	department: Department
	createdAt: string
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

export const departmentPermissions: Record<Department, ResourceType[]> = {
	wildcard: ['note', 'task', 'invoice', 'items'], // Admin has access to everything
	sales: ['note', 'task', 'invoice', 'items'],
	marketing: ['note', 'task'],
	creative: ['note', 'task'],
	hr: ['note', 'invoice'],
}
