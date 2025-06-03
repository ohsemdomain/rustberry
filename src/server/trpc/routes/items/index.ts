import {
	hasPermission,
	permissionProcedure,
} from '@/server/trpc/middleware/auth'
import { router } from '@/server/trpc/trpc-instance'
import { generateUniqueId } from '@/server/trpc/utils/id-generator'
import {
	addPriceDisplay,
	addPriceDisplayToList,
} from '@/server/trpc/utils/price'
import { ID_PREFIX, type Item, ItemCategory, ItemStatus } from '@/shared/items'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

// Zod schemas for validation
const createItemSchema = z.object({
	item_name: z.string().min(1).max(255),
	item_category: z.nativeEnum(ItemCategory),
	item_price_cents: z.number().int().min(0),
	item_description: z.string().optional(),
})

const updateItemSchema = z.object({
	id: z.string(),
	item_name: z.string().min(1).max(255).optional(),
	item_category: z.nativeEnum(ItemCategory).optional(),
	item_price_cents: z.number().int().min(0).optional(),
	item_description: z.string().nullable().optional(),
	item_status: z.nativeEnum(ItemStatus).optional(),
})

const listAllItemsSchema = z.object({
	status: z.nativeEnum(ItemStatus).optional(),
})

export const itemsRouter = router({
	// Create item
	create: permissionProcedure('items', 'create')
		.input(createItemSchema)
		.mutation(async ({ input, ctx }) => {
			// User already has create permission from middleware
			const id = await generateUniqueId(ctx.env, ID_PREFIX, 'item')
			const now = Date.now()

			const item: Item = {
				id,
				item_name: input.item_name,
				item_category: input.item_category,
				item_price_cents: input.item_price_cents,
				item_description: input.item_description || null,
				item_status: ItemStatus.ACTIVE, // Always active by default
				created_at: now,
				updated_at: now,
				created_by: ctx.user.id,
				updated_by: ctx.user.id,
			}

			try {
				await ctx.env.DB.prepare(
					`INSERT INTO items (
						id, item_name, item_category, item_price_cents, 
						item_description, item_status, created_at, updated_at,
						created_by, updated_by
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						item.id,
						item.item_name,
						item.item_category,
						item.item_price_cents,
						item.item_description,
						item.item_status,
						item.created_at,
						item.updated_at,
						item.created_by,
						item.updated_by,
					)
					.run()

				return addPriceDisplay(item)
			} catch (error) {
				console.error('Failed to create item:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create item',
				})
			}
		}),

	// List ALL items for client-side filtering
	listAll: permissionProcedure('items', 'read')
		.input(listAllItemsSchema)
		.query(async ({ input, ctx }) => {
			const { status } = input

			let query = 'SELECT * FROM items WHERE 1=1'
			const params: unknown[] = []

			// Filter by status only (no search, no pagination)
			if (status !== undefined) {
				query += ' AND item_status = ?'
				params.push(status)
			}

			// Order by created_at (newest first)
			query += ' ORDER BY created_at DESC'

			try {
				// Get ALL items for the current status filter
				const { results } = await ctx.env.DB.prepare(query)
					.bind(...params)
					.all<Item>()

				// Get total count (same as results length since we're getting all)
				const totalItems = results.length

				return {
					items: addPriceDisplayToList(results),
					totalItems,
				}
			} catch (error) {
				console.error('Failed to list all items:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to list all items',
				})
			}
		}),

	// Get item by ID
	getById: permissionProcedure('items', 'read')
		.input(z.string())
		.query(async ({ input, ctx }) => {
			try {
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM items WHERE id = ?',
				)
					.bind(input)
					.all<Item>()

				const item = results[0]
				if (!item) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Item not found',
					})
				}

				return addPriceDisplay(item)
			} catch (error) {
				if (error instanceof TRPCError) throw error

				console.error('Failed to get item:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to get item',
				})
			}
		}),

	// Update item
	update: permissionProcedure('items', 'update-any')
		.input(updateItemSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updates } = input

			// First, get the existing item
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM items WHERE id = ?',
			)
				.bind(id)
				.all<Item>()

			const existingItem = results[0]
			if (!existingItem) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Item not found',
				})
			}

			// Check ownership-based permissions
			const canUpdate =
				hasPermission(ctx.user, 'items', 'update-any') ||
				hasPermission(ctx.user, 'items', 'update-own', existingItem)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this item',
				})
			}

			const updateFields: string[] = []
			const updateValues: unknown[] = []

			// Build dynamic update query
			if (updates.item_name !== undefined) {
				updateFields.push('item_name = ?')
				updateValues.push(updates.item_name)
			}
			if (updates.item_category !== undefined) {
				updateFields.push('item_category = ?')
				updateValues.push(updates.item_category)
			}
			if (updates.item_price_cents !== undefined) {
				updateFields.push('item_price_cents = ?')
				updateValues.push(updates.item_price_cents)
			}
			if (updates.item_description !== undefined) {
				updateFields.push('item_description = ?')
				updateValues.push(updates.item_description)
			}
			if (updates.item_status !== undefined) {
				updateFields.push('item_status = ?')
				updateValues.push(updates.item_status)
			}

			// Always update these fields
			updateFields.push('updated_at = ?', 'updated_by = ?')
			updateValues.push(Date.now(), ctx.user.id)

			// Add ID for WHERE clause
			updateValues.push(id)

			try {
				await ctx.env.DB.prepare(
					`UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
				)
					.bind(...updateValues)
					.run()

				// Get updated item
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM items WHERE id = ?',
				)
					.bind(id)
					.all<Item>()

				return addPriceDisplay(results[0])
			} catch (error) {
				console.error('Failed to update item:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update item',
				})
			}
		}),
})
