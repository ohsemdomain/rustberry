import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '~/auth/types'

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

		if (!payload.userId || !payload.email || !payload.department) {
			return null
		}
		return {
			userId: payload.userId as string,
			email: payload.email as string,
			department: payload.department as JWTPayload['department'],
		}
	} catch {
		return null
	}
}

export function getJWTSecret(env: { JWT_SECRET?: string }): string {
	if (!env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured')
	}
	return env.JWT_SECRET
}
