import type { Env } from '@/server/worker-env'
import type { JWTPayload } from '@/shared/types'
import { SignJWT, jwtVerify } from 'jose'

export async function createJWT(
	payload: JWTPayload,
	secret: string,
): Promise<string> {
	const secretKey = new TextEncoder().encode(secret)

	const token = await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('30d')
		.setIssuedAt()
		.sign(secretKey)

	return token
}

export async function verifyJWT(
	token: string,
	secret: string,
): Promise<JWTPayload | null> {
	try {
		const secretKey = new TextEncoder().encode(secret)
		const { payload } = await jwtVerify(token, secretKey)

		if (!payload.userId || !payload.email || !payload.role) {
			return null
		}
		return {
			userId: payload.userId as string,
			email: payload.email as string,
			role: payload.role as JWTPayload['role'],
		}
	} catch {
		return null
	}
}

export function getJWTSecret(env: Env): string {
	if (!env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured')
	}
	return env.JWT_SECRET
}
