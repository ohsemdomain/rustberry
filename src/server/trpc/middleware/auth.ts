import { getJWTSecret, verifyJWT } from '@/server/auth/jwt'
import { getUserById } from '@/server/db/users'
import { hasPermission as checkPermission } from '@/server/lib/permissions'
import { middleware, publicProcedure } from '@/server/trpc/trpc-instance'
import type { PermissionAction, ResourceType, User } from '@/shared/types'
import { TRPCError } from '@trpc/server'

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

	const storedUser = await getUserById(ctx.env.DB, payload.userId)
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

// Re-export permission helper from lib
export { hasPermission } from '@/server/lib/permissions'

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
			if (!checkPermission(ctx.user, resource, action)) {
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
