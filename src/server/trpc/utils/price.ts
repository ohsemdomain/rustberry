/**
 * Backend price utilities
 * All calculations should be done in cents (integers)
 */

/**
 * Convert cents to display format for frontend
 * @param cents - Price in cents
 * @returns Display format string (e.g., "25.00")
 */
export function centsToDisplay(cents: number): string {
	return (cents / 100).toFixed(2)
}

/**
 * Calculate line item total
 * @param priceCents - Unit price in cents
 * @param quantity - Quantity
 * @returns Total in cents
 */
export function calculateLineTotal(
	priceCents: number,
	quantity: number,
): number {
	return priceCents * quantity
}

/**
 * Calculate discount amount
 * @param originalCents - Original price in cents
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discount amount in cents
 */
export function calculateDiscount(
	originalCents: number,
	discountPercent: number,
): number {
	return Math.round((originalCents * discountPercent) / 100)
}

/**
 * Calculate tax amount
 * @param amountCents - Base amount in cents
 * @param taxPercent - Tax percentage (e.g., 6 for 6%)
 * @returns Tax amount in cents
 */
export function calculateTax(amountCents: number, taxPercent: number): number {
	return Math.round((amountCents * taxPercent) / 100)
}

/**
 * Add display fields to an item
 * @param item - Item with price_cents
 * @returns Item with additional display fields
 */
export function addPriceDisplay<T extends { item_price_cents: number }>(
	item: T,
): T & { price_display: string } {
	return {
		...item,
		price_display: centsToDisplay(item.item_price_cents),
	}
}

/**
 * Add display fields to multiple items
 * @param items - Array of items with price_cents
 * @returns Items with additional display fields
 */
export function addPriceDisplayToList<T extends { item_price_cents: number }>(
	items: T[],
): Array<T & { price_display: string }> {
	return items.map(addPriceDisplay)
}

/**
 * Invoice calculation helper
 * @param items - Array of items with price and quantity
 * @param taxPercent - Tax percentage
 * @param discountPercent - Discount percentage
 * @returns Complete calculation breakdown
 */
export interface InvoiceCalculation {
	subtotal_cents: number
	discount_cents: number
	taxable_amount_cents: number
	tax_cents: number
	total_cents: number
	// Display values
	subtotal_display: string
	discount_display: string
	tax_display: string
	total_display: string
}

export function calculateInvoice(
	items: Array<{ price_cents: number; quantity: number }>,
	taxPercent = 0,
	discountPercent = 0,
): InvoiceCalculation {
	// Calculate subtotal
	const subtotal_cents = items.reduce(
		(sum, item) => sum + calculateLineTotal(item.price_cents, item.quantity),
		0,
	)

	// Calculate discount
	const discount_cents = calculateDiscount(subtotal_cents, discountPercent)

	// Calculate taxable amount (after discount)
	const taxable_amount_cents = subtotal_cents - discount_cents

	// Calculate tax
	const tax_cents = calculateTax(taxable_amount_cents, taxPercent)

	// Calculate total
	const total_cents = taxable_amount_cents + tax_cents

	return {
		subtotal_cents,
		discount_cents,
		taxable_amount_cents,
		tax_cents,
		total_cents,
		// Display values
		subtotal_display: centsToDisplay(subtotal_cents),
		discount_display: centsToDisplay(discount_cents),
		tax_display: centsToDisplay(tax_cents),
		total_display: centsToDisplay(total_cents),
	}
}
