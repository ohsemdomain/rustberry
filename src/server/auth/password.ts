export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder()
	const salt = crypto.getRandomValues(new Uint8Array(16))

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits'],
	)

	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256',
		},
		keyMaterial,
		256,
	)

	// Combine salt + hash and convert to base64
	const hashArray = new Uint8Array(hash)
	const combined = new Uint8Array(salt.length + hashArray.length)
	combined.set(salt)
	combined.set(hashArray, salt.length)

	return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(
	password: string,
	storedHash: string,
): Promise<boolean> {
	try {
		const encoder = new TextEncoder()
		const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0))

		// Extract salt and hash
		const salt = combined.slice(0, 16)
		const storedHashBytes = combined.slice(16)

		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			encoder.encode(password),
			'PBKDF2',
			false,
			['deriveBits'],
		)

		const hash = await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			256,
		)

		const hashArray = new Uint8Array(hash)

		// Compare hashes
		if (hashArray.length !== storedHashBytes.length) {
			return false
		}

		for (let i = 0; i < hashArray.length; i++) {
			if (hashArray[i] !== storedHashBytes[i]) {
				return false
			}
		}

		return true
	} catch {
		return false
	}
}
