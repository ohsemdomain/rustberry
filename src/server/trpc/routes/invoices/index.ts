import {
	hasPermission,
	permissionProcedure,
} from '@/server/trpc/middleware/auth'
import { router } from '@/server/trpc/trpc-instance'
import { generateUniqueId } from '@/server/trpc/utils/id-generator'
import {
	INVOICE_ID_PREFIX,
	INVOICE_ITEM_ID_PREFIX,
	InvoiceStatus,
	type Invoice,
	type InvoiceItem,
} from '@/shared/invoice'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { D1PreparedStatement } from '@cloudflare/workers-types'

const INVOICES_PER_PAGE = 20

// Zod schemas for validation
const invoiceItemSchema = z.object({
	item_id: z.string().nullable().optional(),
	description: z.string().min(1),
	quantity: z.number().int().min(1),
	unit_price_cents: z.number().int().min(0),
})

const createInvoiceSchema = z.object({
	customer_id: z.string().nullable().optional(),
	customer_name: z.string().min(1),
	customer_email: z.string().email().nullable().optional(),
	customer_phone: z.string().nullable().optional(),
	// Billing address
	billing_address_line1: z.string().nullable().optional(),
	billing_address_line2: z.string().nullable().optional(),
	billing_address_line3: z.string().nullable().optional(),
	billing_address_line4: z.string().nullable().optional(),
	billing_postcode: z.string().nullable().optional(),
	billing_city: z.string().nullable().optional(),
	billing_state: z.string().nullable().optional(),
	billing_country: z.string().nullable().optional(),
	// Shipping address
	shipping_address_line1: z.string().nullable().optional(),
	shipping_address_line2: z.string().nullable().optional(),
	shipping_address_line3: z.string().nullable().optional(),
	shipping_address_line4: z.string().nullable().optional(),
	shipping_postcode: z.string().nullable().optional(),
	shipping_city: z.string().nullable().optional(),
	shipping_state: z.string().nullable().optional(),
	shipping_country: z.string().nullable().optional(),
	invoice_date: z.number().int().optional(),
	discount_percent: z.number().int().min(0).max(100).optional().default(0),
	tax_percent: z.number().int().min(0).optional().default(0),
	notes: z.string().nullable().optional(),
	items: z.array(invoiceItemSchema).min(1),
})

const updateInvoiceSchema = z.object({
	id: z.string(),
	customer_name: z.string().min(1).optional(),
	customer_email: z.string().email().nullable().optional(),
	customer_phone: z.string().nullable().optional(),
	// Billing address
	billing_address_line1: z.string().nullable().optional(),
	billing_address_line2: z.string().nullable().optional(),
	billing_address_line3: z.string().nullable().optional(),
	billing_address_line4: z.string().nullable().optional(),
	billing_postcode: z.string().nullable().optional(),
	billing_city: z.string().nullable().optional(),
	billing_state: z.string().nullable().optional(),
	billing_country: z.string().nullable().optional(),
	// Shipping address
	shipping_address_line1: z.string().nullable().optional(),
	shipping_address_line2: z.string().nullable().optional(),
	shipping_address_line3: z.string().nullable().optional(),
	shipping_address_line4: z.string().nullable().optional(),
	shipping_postcode: z.string().nullable().optional(),
	shipping_city: z.string().nullable().optional(),
	shipping_state: z.string().nullable().optional(),
	shipping_country: z.string().nullable().optional(),
	invoice_date: z.number().int().optional(),
	status: z.nativeEnum(InvoiceStatus).optional(),
	discount_percent: z.number().int().min(0).max(100).optional(),
	tax_percent: z.number().int().min(0).optional(),
	notes: z.string().nullable().optional(),
	items: z.array(invoiceItemSchema).optional(),
})

const listInvoicesSchema = z.object({
	page: z.number().int().min(1).default(1),
	status: z.nativeEnum(InvoiceStatus).optional(),
	search: z.string().optional(),
})

// Helper function to calculate invoice totals
function calculateInvoiceTotals(
	items: Array<{ quantity: number; unit_price_cents: number }>,
	discount_percent: number,
	tax_percent: number,
) {
	// Calculate subtotal
	const subtotal_cents = items.reduce(
		(sum, item) => sum + item.quantity * item.unit_price_cents,
		0,
	)

	// Calculate discount
	const discount_cents = Math.round(subtotal_cents * (discount_percent / 100))

	// Calculate tax on discounted amount
	const taxable_amount = subtotal_cents - discount_cents
	const tax_cents = Math.round(taxable_amount * (tax_percent / 100))

	// Calculate total
	const total_cents = taxable_amount + tax_cents

	return {
		subtotal_cents,
		discount_cents,
		tax_cents,
		total_cents,
	}
}

export const invoicesRouter = router({
	// Create invoice
	create: permissionProcedure('invoices', 'create')
		.input(createInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			const id = await generateUniqueId(ctx.env, INVOICE_ID_PREFIX, 'invoice')
			const invoice_number = await generateUniqueId(ctx.env, INVOICE_ID_PREFIX, 'invoice')
			const now = Date.now()

			// Calculate totals
			const totals = calculateInvoiceTotals(
				input.items,
				input.discount_percent || 0,
				input.tax_percent || 0,
			)

			const invoice: Invoice = {
				id,
				invoice_number,
				customer_id: input.customer_id || null,
				customer_name: input.customer_name,
				customer_email: input.customer_email || null,
				customer_phone: input.customer_phone || null,
				// Billing address
				billing_address_line1: input.billing_address_line1 || null,
				billing_address_line2: input.billing_address_line2 || null,
				billing_address_line3: input.billing_address_line3 || null,
				billing_address_line4: input.billing_address_line4 || null,
				billing_postcode: input.billing_postcode || null,
				billing_city: input.billing_city || null,
				billing_state: input.billing_state || null,
				billing_country: input.billing_country || null,
				// Shipping address
				shipping_address_line1: input.shipping_address_line1 || null,
				shipping_address_line2: input.shipping_address_line2 || null,
				shipping_address_line3: input.shipping_address_line3 || null,
				shipping_address_line4: input.shipping_address_line4 || null,
				shipping_postcode: input.shipping_postcode || null,
				shipping_city: input.shipping_city || null,
				shipping_state: input.shipping_state || null,
				shipping_country: input.shipping_country || null,
				invoice_date: input.invoice_date || now,
				status: InvoiceStatus.UNPAID,
				subtotal_cents: totals.subtotal_cents,
				discount_percent: input.discount_percent || 0,
				discount_cents: totals.discount_cents,
				tax_percent: input.tax_percent || 0,
				tax_cents: totals.tax_cents,
				total_cents: totals.total_cents,
				notes: input.notes || null,
				created_at: now,
				updated_at: now,
				created_by: ctx.user.id,
				updated_by: ctx.user.id,
			}

			try {
				// Start transaction
				const batch: D1PreparedStatement[] = []

				// Insert invoice
				batch.push(
					ctx.env.DB.prepare(
						`INSERT INTO invoices (
							id, invoice_number, customer_id, customer_name, customer_email,
							customer_phone, billing_address_line1, billing_address_line2,
							billing_address_line3, billing_address_line4, billing_postcode,
							billing_city, billing_state, billing_country,
							shipping_address_line1, shipping_address_line2,
							shipping_address_line3, shipping_address_line4,
							shipping_postcode, shipping_city, shipping_state,
							shipping_country, invoice_date, status, subtotal_cents,
							discount_percent, discount_cents, tax_percent, tax_cents,
							total_cents, notes, created_at, updated_at, created_by, updated_by
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					).bind(
						invoice.id,
						invoice.invoice_number,
						invoice.customer_id,
						invoice.customer_name,
						invoice.customer_email,
						invoice.customer_phone,
						invoice.billing_address_line1,
						invoice.billing_address_line2,
						invoice.billing_address_line3,
						invoice.billing_address_line4,
						invoice.billing_postcode,
						invoice.billing_city,
						invoice.billing_state,
						invoice.billing_country,
						invoice.shipping_address_line1,
						invoice.shipping_address_line2,
						invoice.shipping_address_line3,
						invoice.shipping_address_line4,
						invoice.shipping_postcode,
						invoice.shipping_city,
						invoice.shipping_state,
						invoice.shipping_country,
						invoice.invoice_date,
						invoice.status,
						invoice.subtotal_cents,
						invoice.discount_percent,
						invoice.discount_cents,
						invoice.tax_percent,
						invoice.tax_cents,
						invoice.total_cents,
						invoice.notes,
						invoice.created_at,
						invoice.updated_at,
						invoice.created_by,
						invoice.updated_by,
					),
				)

				// Insert invoice items
				for (let i = 0; i < input.items.length; i++) {
					const item = input.items[i]
					const itemId = await generateUniqueId(
						ctx.env,
						INVOICE_ITEM_ID_PREFIX,
						'invoice_item',
					)
					const total_cents = item.quantity * item.unit_price_cents

					batch.push(
						ctx.env.DB.prepare(
							`INSERT INTO invoice_items (
								id, invoice_id, item_id, description, quantity,
								unit_price_cents, total_cents, sort_order,
								created_at, updated_at
							) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
						).bind(
							itemId,
							invoice.id,
							item.item_id || null,
							item.description,
							item.quantity,
							item.unit_price_cents,
							total_cents,
							i,
							now,
							now,
						),
					)
				}

				// Execute batch
				await ctx.env.DB.batch(batch)

				return invoice
			} catch (error) {
				console.error('Failed to create invoice:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create invoice',
				})
			}
		}),

	// List invoices
	list: permissionProcedure('invoices', 'read')
		.input(listInvoicesSchema)
		.query(async ({ input, ctx }) => {
			const { page = 1, status, search } = input
			const offset = (page - 1) * INVOICES_PER_PAGE

			let query = 'SELECT * FROM invoices WHERE 1=1'
			const params: unknown[] = []

			// Filter by status
			if (status !== undefined) {
				query += ' AND status = ?'
				params.push(status)
			}

			// Search by customer name or invoice number
			if (search) {
				query += ' AND (customer_name LIKE ? OR invoice_number LIKE ?)'
				params.push(`%${search}%`, `%${search}%`)
			}

			// Order and pagination
			query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
			params.push(INVOICES_PER_PAGE, offset)

			try {
				// Get invoices
				const { results } = await ctx.env.DB.prepare(query)
					.bind(...params)
					.all<Invoice>()

				// Get total count
				let countQuery = 'SELECT COUNT(*) as count FROM invoices WHERE 1=1'
				const countParams: unknown[] = []

				if (status !== undefined) {
					countQuery += ' AND status = ?'
					countParams.push(status)
				}

				if (search) {
					countQuery += ' AND (customer_name LIKE ? OR invoice_number LIKE ?)'
					countParams.push(`%${search}%`, `%${search}%`)
				}

				const { results: countResult } = await ctx.env.DB.prepare(countQuery)
					.bind(...countParams)
					.all<{ count: number }>()

				const totalItems = countResult[0]?.count || 0
				const totalPages = Math.ceil(totalItems / INVOICES_PER_PAGE)

				return {
					invoices: results,
					totalItems,
					totalPages,
					currentPage: page,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				}
			} catch (error) {
				console.error('Failed to list invoices:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to list invoices',
				})
			}
		}),

	// Get invoice by ID
	getById: permissionProcedure('invoices', 'read')
		.input(z.string())
		.query(async ({ input, ctx }) => {
			try {
				// Get invoice
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM invoices WHERE id = ?',
				)
					.bind(input)
					.all<Invoice>()

				const invoice = results[0]
				if (!invoice) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Invoice not found',
					})
				}

				// Get invoice items
				const { results: items } = await ctx.env.DB.prepare(
					'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order',
				)
					.bind(input)
					.all<InvoiceItem>()

				return {
					...invoice,
					items,
				}
			} catch (error) {
				if (error instanceof TRPCError) throw error

				console.error('Failed to get invoice:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to get invoice',
				})
			}
		}),

	// Update invoice
	update: permissionProcedure('invoices', 'update-any')
		.input(updateInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, items: newItems, ...updates } = input

			// First, get the existing invoice
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM invoices WHERE id = ?',
			)
				.bind(id)
				.all<Invoice>()

			const existingInvoice = results[0]
			if (!existingInvoice) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invoice not found',
				})
			}

			// Check ownership-based permissions
			const canUpdate =
				hasPermission(ctx.user, 'invoices', 'update-any') ||
				hasPermission(ctx.user, 'invoices', 'update-own', existingInvoice)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this invoice',
				})
			}

			const now = Date.now()
			const batch: D1PreparedStatement[] = []

			// If items are provided, recalculate totals
			let totals = {
				subtotal_cents: existingInvoice.subtotal_cents,
				discount_cents: existingInvoice.discount_cents,
				tax_cents: existingInvoice.tax_cents,
				total_cents: existingInvoice.total_cents,
			}

			if (newItems) {
				totals = calculateInvoiceTotals(
					newItems,
					updates.discount_percent ?? existingInvoice.discount_percent,
					updates.tax_percent ?? existingInvoice.tax_percent,
				)
			} else if (
				updates.discount_percent !== undefined ||
				updates.tax_percent !== undefined
			) {
				// Get existing items to recalculate
				const { results: existingItems } = await ctx.env.DB.prepare(
					'SELECT quantity, unit_price_cents FROM invoice_items WHERE invoice_id = ?',
				)
					.bind(id)
					.all<{ quantity: number; unit_price_cents: number }>()

				totals = calculateInvoiceTotals(
					existingItems,
					updates.discount_percent ?? existingInvoice.discount_percent,
					updates.tax_percent ?? existingInvoice.tax_percent,
				)
			}

			// Build update query
			const updateFields: string[] = []
			const updateValues: unknown[] = []

			// Customer info fields
			const customerFields = [
				'customer_name', 'customer_email', 'customer_phone'
			]
			for (const field of customerFields) {
				if (updates[field as keyof typeof updates] !== undefined) {
					updateFields.push(`${field} = ?`)
					updateValues.push(updates[field as keyof typeof updates])
				}
			}

			// Address fields
			const addressFields = [
				'billing_address_line1', 'billing_address_line2',
				'billing_address_line3', 'billing_address_line4',
				'billing_postcode', 'billing_city', 'billing_state',
				'billing_country', 'shipping_address_line1',
				'shipping_address_line2', 'shipping_address_line3',
				'shipping_address_line4', 'shipping_postcode',
				'shipping_city', 'shipping_state', 'shipping_country'
			]
			for (const field of addressFields) {
				if (updates[field as keyof typeof updates] !== undefined) {
					updateFields.push(`${field} = ?`)
					updateValues.push(updates[field as keyof typeof updates])
				}
			}

			// Other fields
			if (updates.invoice_date !== undefined) {
				updateFields.push('invoice_date = ?')
				updateValues.push(updates.invoice_date)
			}
			if (updates.status !== undefined) {
				updateFields.push('status = ?')
				updateValues.push(updates.status)
			}
			if (updates.discount_percent !== undefined) {
				updateFields.push('discount_percent = ?')
				updateValues.push(updates.discount_percent)
			}
			if (updates.tax_percent !== undefined) {
				updateFields.push('tax_percent = ?')
				updateValues.push(updates.tax_percent)
			}
			if (updates.notes !== undefined) {
				updateFields.push('notes = ?')
				updateValues.push(updates.notes)
			}

			// Always update totals and metadata
			updateFields.push(
				'subtotal_cents = ?',
				'discount_cents = ?',
				'tax_cents = ?',
				'total_cents = ?',
				'updated_at = ?',
				'updated_by = ?',
			)
			updateValues.push(
				totals.subtotal_cents,
				totals.discount_cents,
				totals.tax_cents,
				totals.total_cents,
				now,
				ctx.user.id,
			)

			// Add ID for WHERE clause
			updateValues.push(id)

			try {
				// Update invoice
				batch.push(
					ctx.env.DB.prepare(
						`UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ?`,
					).bind(...updateValues),
				)

				// If items are provided, update them
				if (newItems) {
					// Delete existing items
					batch.push(
						ctx.env.DB.prepare(
							'DELETE FROM invoice_items WHERE invoice_id = ?',
						).bind(id),
					)

					// Insert new items
					for (let i = 0; i < newItems.length; i++) {
						const item = newItems[i]
						const itemId = await generateUniqueId(
							ctx.env,
							INVOICE_ITEM_ID_PREFIX,
							'invoice_item',
						)
						const total_cents = item.quantity * item.unit_price_cents

						batch.push(
							ctx.env.DB.prepare(
								`INSERT INTO invoice_items (
									id, invoice_id, item_id, description, quantity,
									unit_price_cents, total_cents, sort_order,
									created_at, updated_at
								) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
							).bind(
								itemId,
								id,
								item.item_id || null,
								item.description,
								item.quantity,
								item.unit_price_cents,
								total_cents,
								i,
								now,
								now,
							),
						)
					}
				}

				// Execute batch
				await ctx.env.DB.batch(batch)

				// Get updated invoice
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM invoices WHERE id = ?',
				)
					.bind(id)
					.all<Invoice>()

				return results[0]
			} catch (error) {
				console.error('Failed to update invoice:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update invoice',
				})
			}
		}),

	// Update invoice status
	updateStatus: permissionProcedure('invoices', 'update-any')
		.input(
			z.object({
				id: z.string(),
				status: z.nativeEnum(InvoiceStatus),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// First, get the existing invoice
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM invoices WHERE id = ?',
			)
				.bind(input.id)
				.all<Invoice>()

			const existingInvoice = results[0]
			if (!existingInvoice) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invoice not found',
				})
			}

			// Check ownership-based permissions
			const canUpdate =
				hasPermission(ctx.user, 'invoices', 'update-any') ||
				hasPermission(ctx.user, 'invoices', 'update-own', existingInvoice)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this invoice',
				})
			}

			try {
				await ctx.env.DB.prepare(
					`UPDATE invoices SET 
						status = ?, 
						updated_at = ?, 
						updated_by = ? 
					WHERE id = ?`,
				)
					.bind(input.status, Date.now(), ctx.user.id, input.id)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to update invoice status:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update invoice status',
				})
			}
		}),

	// Delete invoice (cancelled status)
	delete: permissionProcedure('invoices', 'delete-any')
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			// First, get the existing invoice
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM invoices WHERE id = ?',
			)
				.bind(id)
				.all<Invoice>()

			const existingInvoice = results[0]
			if (!existingInvoice) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invoice not found',
				})
			}

			// Check ownership-based permissions
			const canDelete =
				hasPermission(ctx.user, 'invoices', 'delete-any') ||
				hasPermission(ctx.user, 'invoices', 'delete-own', existingInvoice)

			if (!canDelete) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to delete this invoice',
				})
			}

			try {
				// Soft delete by setting status to cancelled
				await ctx.env.DB.prepare(
					`UPDATE invoices SET 
						status = ?, 
						updated_at = ?, 
						updated_by = ? 
					WHERE id = ?`,
				)
					.bind(InvoiceStatus.CANCELLED, Date.now(), ctx.user.id, id)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to delete invoice:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete invoice',
				})
			}
		}),
})