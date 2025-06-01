import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { departmentProcedure } from '~/trpc/middleware/auth'
import { router } from '~/trpc/trpc-instance'
import { canPerformAction } from '~/trpc/auth/auth-registry'
import { generateFallbackId, generateUniqueId } from '~/trpc/utils/id-generator'
import { addPriceDisplay, addPriceDisplayToList } from '~/trpc/utils/price'
import {
	ID_PREFIX,
	ITEMS_PER_PAGE,
	type Item,
	ItemCategory,
	ItemStatus,
} from './types'

// Zod schemas for validation
const createItemSchema = z.object({
	item_name: z.string().min(1).max(255),
	item_category: z.nativeEnum(ItemCategory),
	item_price_cents: z.number().int().min(0),
	item_description: z.string().optional(),
	item_status: z.nativeEnum(ItemStatus).optional().default(ItemStatus.ACTIVE),
})

const updateItemSchema = z.object({
	id: z.string(),
	item_name: z.string().min(1).max(255).optional(),
	item_category: z.nativeEnum(ItemCategory).optional(),
	item_price_cents: z.number().int().min(0).optional(),
	item_description: z.string().nullable().optional(),
	item_status: z.nativeEnum(ItemStatus).optional(),
})

const listItemsSchema = z.object({
	page: z.number().int().min(1).default(1),
	status: z.nativeEnum(ItemStatus).optional(),
	search: z.string().optional(),
})

// Only wildcard and sales departments can access items
const itemsProcedure = departmentProcedure('items')

export const itemsRouter = router({
	// Create item
	create: itemsProcedure
		.input(createItemSchema)
		.mutation(async ({ input, ctx }) => {
			// Check create permission
			if (!canPerformAction(ctx.user.department, 'items', 'create')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to create items',
				})
			}

			try {
				// Generate unique ID
				const id = await generateUniqueId(ctx.env, ID_PREFIX, 'item')

				const now = Math.floor(Date.now() / 1000) // Unix timestamp

				// Insert item into database
				const result = await ctx.env.DB.prepare(
					`INSERT INTO items (
						id, item_name, item_category, item_price_cents, 
						item_description, item_status, created_at, updated_at, 
						created_by, updated_by
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						id,
						input.item_name,
						input.item_category,
						input.item_price_cents,
						input.item_description || null,
						input.item_status || ItemStatus.ACTIVE,
						now,
						now,
						ctx.user.id,
						ctx.user.id,
					)
					.run()

				if (!result.success) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to create item',
					})
				}

				// Get the created item with all fields
				const createdItem = await ctx.env.DB.prepare(
					'SELECT * FROM items WHERE id = ?',
				)
					.bind(id)
					.first<Item>()

				if (!createdItem) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to retrieve created item',
					})
				}

				return addPriceDisplay(createdItem)
			} catch (error) {
				// If ID generation fails, try with fallback
				if (error instanceof Error && error.message.includes('KV')) {
					const fallbackId = generateFallbackId(ID_PREFIX)
					// Retry with fallback ID
					const now = Math.floor(Date.now() / 1000)
					await ctx.env.DB.prepare(
						`INSERT INTO items (
							id, item_name, item_category, item_price_cents, 
							item_description, item_status, created_at, updated_at, 
							created_by, updated_by
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					)
						.bind(
							fallbackId,
							input.item_name,
							input.item_category,
							input.item_price_cents,
							input.item_description || null,
							input.item_status || ItemStatus.ACTIVE,
							now,
							now,
							ctx.user.id,
							ctx.user.id,
						)
						.run()
					// Get the created item
					const createdItem = await ctx.env.DB.prepare(
						'SELECT * FROM items WHERE id = ?',
					)
						.bind(fallbackId)
						.first<Item>()

					if (!createdItem) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Failed to retrieve created item',
						})
					}

					return addPriceDisplay(createdItem)
				}
				throw error
			}
		}),

	// Get single item by ID
	getById: itemsProcedure
		.input(z.string())
		.query(async ({ input: id, ctx }) => {
			// Check read permission
			if (!canPerformAction(ctx.user.department, 'items', 'read')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to view items',
				})
			}

			const result = await ctx.env.DB.prepare(
				'SELECT * FROM items WHERE id = ?',
			)
				.bind(id)
				.first<Item>()

			if (!result) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Item not found',
				})
			}

			return addPriceDisplay(result)
		}),

	// List items with pagination and filters
	list: itemsProcedure.input(listItemsSchema).query(async ({ input, ctx }) => {
		// Check read permission
		if (!canPerformAction(ctx.user.department, 'items', 'read')) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You do not have permission to view items',
			})
		}

		const { page, status, search } = input
		const limit = ITEMS_PER_PAGE
		const offset = (page - 1) * limit

		// Build query with filters
		let query = 'SELECT * FROM items WHERE 1=1'
		let countQuery = 'SELECT COUNT(*) as count FROM items WHERE 1=1'
		const params: (string | number)[] = []
		const countParams: (string | number)[] = []

		// Status filter (default to ACTIVE if not specified)
		if (status !== undefined) {
			query += ' AND item_status = ?'
			countQuery += ' AND item_status = ?'
			params.push(status)
			countParams.push(status)
		} else {
			// Default to active items only
			query += ' AND item_status = ?'
			countQuery += ' AND item_status = ?'
			params.push(ItemStatus.ACTIVE)
			countParams.push(ItemStatus.ACTIVE)
		}

		// Search filter (item name only)
		if (search) {
			query += ' AND item_name LIKE ?'
			countQuery += ' AND item_name LIKE ?'
			const searchPattern = `%${search}%`
			params.push(searchPattern)
			countParams.push(searchPattern)
		}

		// Order by created_at DESC (latest first)
		query += ' ORDER BY created_at DESC'

		// Add pagination
		query += ' LIMIT ? OFFSET ?'
		params.push(limit, offset)

		// Execute queries
		const [itemsResult, countResult] = await Promise.all([
			ctx.env.DB.prepare(query)
				.bind(...params)
				.all<Item>(),
			ctx.env.DB.prepare(countQuery)
				.bind(...countParams)
				.first<{ count: number }>(),
		])

		const totalCount = countResult?.count || 0
		const totalPages = Math.ceil(totalCount / limit)

		return {
			items: addPriceDisplayToList(itemsResult.results || []),
			totalCount,
			currentPage: page,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		}
	}),

	// Update item
	update: itemsProcedure
		.input(updateItemSchema)
		.mutation(async ({ input, ctx }) => {
			// Check update permission
			if (!canPerformAction(ctx.user.department, 'items', 'update')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update items',
				})
			}

			const { id, ...updates } = input

			// Check if item exists
			const existing = await ctx.env.DB.prepare(
				'SELECT * FROM items WHERE id = ?',
			)
				.bind(id)
				.first<Item>()

			if (!existing) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Item not found',
				})
			}

			// Build update query dynamically
			const updateFields: string[] = []
			const updateValues: (string | number | null)[] = []

			for (const [key, value] of Object.entries(updates)) {
				if (value !== undefined) {
					updateFields.push(`${key} = ?`)
					updateValues.push(value)
				}
			}

			// Always update updated_at and updated_by
			updateFields.push('updated_at = ?', 'updated_by = ?')
			updateValues.push(Math.floor(Date.now() / 1000), ctx.user.id)

			// Add ID for WHERE clause
			updateValues.push(id)

			const updateQuery = `
				UPDATE items 
				SET ${updateFields.join(', ')}
				WHERE id = ?
			`

			const result = await ctx.env.DB.prepare(updateQuery)
				.bind(...updateValues)
				.run()

			if (!result.success) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update item',
				})
			}

			// Return updated item
			const updatedItem = await ctx.env.DB.prepare('SELECT * FROM items WHERE id = ?')
				.bind(id)
				.first<Item>()

			if (!updatedItem) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve updated item',
				})
			}

			return addPriceDisplay(updatedItem)
		}),

	// Delete item (soft delete by setting status to INACTIVE)
	delete: itemsProcedure
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			// Check delete permission
			if (!canPerformAction(ctx.user.department, 'items', 'delete')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to delete items',
				})
			}

			// Check if item exists
			const existing = await ctx.env.DB.prepare(
				'SELECT * FROM items WHERE id = ?',
			)
				.bind(id)
				.first<Item>()

			if (!existing) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Item not found',
				})
			}

			// Soft delete by setting status to INACTIVE
			const result = await ctx.env.DB.prepare(
				`UPDATE items 
				SET item_status = ?, updated_at = ?, updated_by = ?
				WHERE id = ?`,
			)
				.bind(
					ItemStatus.INACTIVE,
					Math.floor(Date.now() / 1000),
					ctx.user.id,
					id,
				)
				.run()

			if (!result.success) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete item',
				})
			}

			return { success: true }
		}),
})
