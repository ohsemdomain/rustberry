import {
	type OwnedResource,
	type PermissionAction,
	type ResourceType,
	type User,
	rolePermissions,
} from '@/shared/types'

export function hasPermission(
	user: User,
	resource: ResourceType,
	action: PermissionAction | 'update' | 'delete',
	item?: OwnedResource,
): boolean {
	const userPermissions = rolePermissions[user.role]?.[resource] || []

	// Check for direct permission
	if (userPermissions.includes(action as PermissionAction)) return true

	// Handle granular permissions for update/delete
	if (action === 'update' && item) {
		if (userPermissions.includes('update-any')) return true
		if (userPermissions.includes('update-own') && item.created_by === user.id)
			return true
	}

	if (action === 'delete' && item) {
		if (userPermissions.includes('delete-any')) return true
		if (userPermissions.includes('delete-own') && item.created_by === user.id)
			return true
	}

	return false
}

// Helper functions for common permission checks
export function canRead(user: User, resource: ResourceType): boolean {
	return hasPermission(user, resource, 'read')
}

export function canCreate(user: User, resource: ResourceType): boolean {
	return hasPermission(user, resource, 'create')
}

export function canUpdate(
	user: User,
	resource: ResourceType,
	item?: OwnedResource,
): boolean {
	return hasPermission(user, resource, 'update', item)
}

export function canDelete(
	user: User,
	resource: ResourceType,
	item?: OwnedResource,
): boolean {
	return hasPermission(user, resource, 'delete', item)
}
