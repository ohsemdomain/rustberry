import { createJWT, getJWTSecret, verifyJWT } from '@/server/auth/jwt'
import { verifyPassword } from '@/server/auth/password'
import { getUserByEmail, getUserById } from '@/server/db/users'
import { publicProcedure, router } from '@/server/trpc/trpc-instance'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export const authRouter = router({
	login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
		const { email, password } = input

		// Find user by email
		const storedUser = await getUserByEmail(ctx.env.DB, email)
		if (!storedUser) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Invalid credentials',
			})
		}

		// Verify password
		const isValid = await verifyPassword(password, storedUser.passwordHash)
		if (!isValid) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Invalid credentials',
			})
		}

		// Create JWT token
		const jwtSecret = getJWTSecret(ctx.env)
		const token = await createJWT(
			{
				userId: storedUser.id,
				email: storedUser.email,
				role: storedUser.role,
			},
			jwtSecret,
		)

		// Return user data without password hash
		const { passwordHash, ...user } = storedUser

		return {
			token,
			user,
		}
	}),

	me: publicProcedure.query(async ({ ctx }) => {
		// Get token from Authorization header
		const authHeader = ctx.headers.get('Authorization')
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return null
		}

		const token = authHeader.substring(7)
		const jwtSecret = getJWTSecret(ctx.env)

		// Verify token
		const payload = await verifyJWT(token, jwtSecret)
		if (!payload) {
			return null
		}

		// Get user data
		const storedUser = await getUserById(ctx.env.DB, payload.userId)
		if (!storedUser) {
			return null
		}

		// Return user data without password hash
		const { passwordHash, ...user } = storedUser
		return user
	}),

	logout: publicProcedure.mutation(async () => {
		// Since we're using stateless JWTs, logout is handled client-side
		// by removing the token from storage
		return { success: true }
	}),
})
