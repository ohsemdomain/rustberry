import type { Department, ResourceType } from '~/auth/types'

/**
 * Centralized permission registry
 * All resource permissions are defined here
 */

// Define which departments can perform which actions on each resource
export interface ResourcePermissions {
	create: Department[]
	read: Department[]
	update: Department[]
	delete: Department[]
}

// Permission registry for all resources
export const permissionRegistry: Record<ResourceType, ResourcePermissions> = {
	items: {
		create: ['wildcard', 'sales'],
		read: ['wildcard', 'sales'],
		update: ['wildcard', 'sales'],
		delete: ['wildcard', 'sales'],
	},
	note: {
		create: ['wildcard', 'sales', 'marketing', 'creative'],
		read: ['wildcard', 'sales', 'marketing', 'creative'],
		update: ['wildcard', 'sales', 'marketing', 'creative'],
		delete: ['wildcard', 'sales', 'marketing', 'creative'],
	},
	task: {
		create: ['wildcard', 'sales', 'marketing', 'creative'],
		read: ['wildcard', 'sales', 'marketing', 'creative'],
		update: ['wildcard', 'sales', 'marketing', 'creative'],
		delete: ['wildcard', 'sales', 'marketing', 'creative'],
	},
	invoice: {
		create: ['wildcard', 'sales', 'hr'],
		read: ['wildcard', 'sales', 'hr'],
		update: ['wildcard', 'sales', 'hr'],
		delete: ['wildcard', 'sales', 'hr'],
	},
}

// Helper functions to check permissions
export function canPerformAction(
	department: Department,
	resource: ResourceType,
	action: keyof ResourcePermissions
): boolean {
	const permissions = permissionRegistry[resource]
	if (!permissions) return false
	
	return permissions[action].includes(department)
}

export function getDepartmentsWithAccess(
	resource: ResourceType,
	action: keyof ResourcePermissions
): Department[] {
	const permissions = permissionRegistry[resource]
	if (!permissions) return []
	
	return permissions[action]
}

// Get all resources a department can access
export function getAccessibleResources(
	department: Department
): ResourceType[] {
	const resources: ResourceType[] = []
	
	for (const [resource, permissions] of Object.entries(permissionRegistry)) {
		// If department can perform any action on the resource, include it
		if (
			permissions.create.includes(department) ||
			permissions.read.includes(department) ||
			permissions.update.includes(department) ||
			permissions.delete.includes(department)
		) {
			resources.push(resource as ResourceType)
		}
	}
	
	return resources
}

// Check if department has any access to a resource
export function hasResourceAccess(
	department: Department,
	resource: ResourceType
): boolean {
	const permissions = permissionRegistry[resource]
	if (!permissions) return false
	
	return (
		permissions.create.includes(department) ||
		permissions.read.includes(department) ||
		permissions.update.includes(department) ||
		permissions.delete.includes(department)
	)
}