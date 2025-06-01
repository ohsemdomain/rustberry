#!/usr/bin/env bun

// Utility script to generate password hashes for new users
// Usage: bun run src/worker/auth/hash-password.ts

import { hashPassword } from '~/auth/password'

async function main() {
	const password = process.argv[2]

	if (!password) {
		console.log('Usage: bun run src/worker/auth/hash-password.ts <password>')
		console.log(
			'Example: bun run src/worker/auth/hash-password.ts mySecurePassword123',
		)
		process.exit(1)
	}

	try {
		const hash = await hashPassword(password)
		console.log('\nPassword hash generated successfully!')
		console.log('Add this to your users.ts file:\n')
		console.log(`passwordHash: '${hash}'`)
		console.log('\nNever commit the plain text password to your repository.')
	} catch (error) {
		console.error('Error generating hash:', error)
		process.exit(1)
	}
}

main()
