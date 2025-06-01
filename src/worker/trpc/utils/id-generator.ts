import type { Env } from '~/worker-env'

interface IdCounterData {
	year: number
	count: number
}

/**
 * Generates a unique ID with format: PREFIX + YY + XXX
 * e.g., ITEM25001, ITEM25002, etc.
 * Resets counter each year
 */
export async function generateUniqueId(
	env: Env,
	prefix: string,
	resourceType: string,
): Promise<string> {
	const currentYear = new Date().getFullYear()
	const yearSuffix = currentYear.toString().slice(-2) // Get last 2 digits of year
	const kvKey = `${resourceType}_counter_${currentYear}`

	// Get current counter from KV
	const counterData = await env.rustyberry_kv.get<IdCounterData>(kvKey, 'json')

	let nextCount = 1
	if (counterData && counterData.year === currentYear) {
		nextCount = counterData.count + 1
	}

	// Update counter in KV
	await env.rustyberry_kv.put(
		kvKey,
		JSON.stringify({ year: currentYear, count: nextCount }),
		{
			// Set expiration to end of next year to ensure data persists through the year
			expirationTtl: 60 * 60 * 24 * 400, // ~400 days
		},
	)

	// Format the ID with zero padding
	const paddedCount = nextCount.toString().padStart(3, '0')
	return `${prefix}${yearSuffix}${paddedCount}`
}

/**
 * Alternative ID generator using crypto.randomUUID() as fallback
 * This ensures we always get a unique ID even if KV fails
 */
export function generateFallbackId(prefix: string): string {
	const uuid = crypto.randomUUID()
	const shortId = uuid.split('-')[0].toUpperCase()
	return `${prefix}_${shortId}`
}
