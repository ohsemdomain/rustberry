/**
 * Price utility functions for display only
 * All calculations should be done in backend with cents
 */

/**
 * Convert cents to display format (e.g., 2500 → "25.00")
 * @param cents - Price in cents
 * @returns Formatted price string without currency
 */
export function centsToDisplay(cents: number): string {
	return (cents / 100).toFixed(2)
}

/**
 * Convert display format to cents (e.g., "25.00" → 2500)
 * @param display - Price as string
 * @returns Price in cents
 */
export function displayToCents(display: string): number {
	// Remove any non-numeric characters except decimal point
	const cleanValue = display.replace(/[^\d.]/g, '')
	const floatValue = Number.parseFloat(cleanValue) || 0
	// Round to avoid floating point issues
	return Math.round(floatValue * 100)
}

/**
 * Format cents with currency (e.g., 2500 → "RM25.00")
 * @param cents - Price in cents
 * @returns Formatted price with currency
 */
export function formatPrice(cents: number): string {
	return `RM${centsToDisplay(cents)}`
}

/**
 * Validate if a string is a valid price format
 * @param value - String to validate
 * @returns Boolean indicating if valid
 */
export function isValidPrice(value: string): boolean {
	// Allow numbers with up to 2 decimal places
	const regex = /^\d+(\.\d{0,2})?$/
	return regex.test(value)
}

/**
 * Parse user input for price fields
 * Allows typing partial values like "25." or "25.5"
 * @param input - User input string
 * @returns Sanitized string for display in input
 */
export function sanitizePriceInput(input: string): string {
	// Remove non-numeric except decimal
	let sanitized = input.replace(/[^\d.]/g, '')

	// Ensure only one decimal point
	const parts = sanitized.split('.')
	if (parts.length > 2) {
		sanitized = `${parts[0]}.${parts.slice(1).join('')}`
	}

	// Limit to 2 decimal places
	if (parts.length === 2 && parts[1].length > 2) {
		sanitized = `${parts[0]}.${parts[1].substring(0, 2)}`
	}

	return sanitized
}
