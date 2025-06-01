import { TRPCError } from '@trpc/server'
import { getJWTSecret, verifyJWT } from '~/auth/jwt'
import type {
	OwnedResource,
	PermissionAction,
	ResourceType,
	User,
} from '~/auth/types'
import { getUserById } from '~/auth/users'
import { middleware, publicProcedure } from '~/trpc/trpc-instance'

// Extend context with user info
export interface AuthContext {
	user: User | null
}

// Middleware to verify JWT and add user to context
export const isAuthenticated = middleware(async ({ ctx, next }) => {
	const authHeader = ctx.headers.get('Authorization')

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Missing or invalid authorization header',
		})
	}

	const token = authHeader.substring(7)
	const jwtSecret = getJWTSecret(ctx.env)

	const payload = await verifyJWT(token, jwtSecret)
	if (!payload) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Invalid or expired token',
		})
	}

	const storedUser = getUserById(payload.userId)
	if (!storedUser) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'User not found',
		})
	}

	const { passwordHash: _, ...user } = storedUser

	return next({
		ctx: {
			...ctx,
			user,
		},
	})
})

// Protected procedure that requires authentication
export const protectedProcedure = publicProcedure.use(isAuthenticated)

// Helper to check if user has permission
export function hasPermission(
	user: User,
	resource: ResourceType,
	action: PermissionAction,
	item?: OwnedResource,
): boolean {
	const resourcePermissions = user.permissions[resource]
	if (!resourcePermissions) return false

	// Check for any-level permissions first
	if (action === 'create' || action === 'read') {
		return resourcePermissions.includes(action)
	}

	// For update/delete, check both any and own permissions
	if (action === 'update-any' || action === 'delete-any') {
		return resourcePermissions.includes(action)
	}

	// Check ownership-based permissions
	if (action === 'update-own' || action === 'delete-own') {
		if (!item) return false
		return resourcePermissions.includes(action) && item.created_by === user.id
	}

	return false
}

// Middleware to check permission for an action
export const requirePermission = (
	resource: ResourceType,
	action: PermissionAction,
) => {
	return middleware(async ({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Not authenticated',
			})
		}

		// For create/read, we can check immediately
		if (action === 'create' || action === 'read') {
			if (!hasPermission(ctx.user, resource, action)) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: `You don't have permission to ${action} ${resource}`,
				})
			}
		}

		// For update/delete, we need the item to check ownership
		// This will be checked in the actual route handler

		return next()
	})
}

// Create a permission-specific protected procedure
export const permissionProcedure = (
	resource: ResourceType,
	action: PermissionAction,
) => {
	return protectedProcedure.use(requirePermission(resource, action))
}
