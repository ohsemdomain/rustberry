import { ItemCategory, ItemStatus } from '@/shared/items'
import { z } from 'zod'

// Zod schemas for validation
export const createItemSchema = z.object({
	item_name: z.string().min(1).max(255),
	item_category: z.nativeEnum(ItemCategory),
	item_price_cents: z.number().int().min(0),
	item_description: z.string().optional(),
})

export const updateItemSchema = z.object({
	id: z.string(),
	item_name: z.string().min(1).max(255).optional(),
	item_category: z.nativeEnum(ItemCategory).optional(),
	item_price_cents: z.number().int().min(0).optional(),
	item_description: z.string().nullable().optional(),
	item_status: z.nativeEnum(ItemStatus).optional(),
})

export const listAllItemsSchema = z.object({
	status: z.nativeEnum(ItemStatus).optional(),
})
