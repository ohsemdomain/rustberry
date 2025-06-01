import { TRPCError } from '@trpc/server'
import { getJWTSecret, verifyJWT } from '~/auth/jwt'
import type { ResourceType, User } from '~/auth/types'
import { departmentPermissions } from '~/auth/types'
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

// Middleware to check department access to resources
export const hasDepartmentAccess = (resource: ResourceType) => {
	return middleware(async ({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Not authenticated',
			})
		}

		const allowedResources = departmentPermissions[ctx.user.department]
		if (!allowedResources.includes(resource)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: `Your department (${ctx.user.department}) does not have access to ${resource}`,
			})
		}

		return next()
	})
}

// Create a department-specific protected procedure
export const departmentProcedure = (resource: ResourceType) => {
	return protectedProcedure.use(hasDepartmentAccess(resource))
}

// Middleware to check ownership (for update/delete operations)
export const checkOwnership = middleware(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Not authenticated',
		})
	}

	// Wildcard users can modify any resource
	if (ctx.user.department === 'wildcard') {
		return next()
	}

	// This will be used later when actual resources are implemented
	// For now, just pass through
	return next({
		ctx: {
			...ctx,
			ownershipCheck: true,
		},
	})
})
