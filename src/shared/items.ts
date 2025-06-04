//src/shared/items.ts
// Items-related types and constants

export enum ItemCategory {
	PACKAGING = 1,
	LABEL = 2,
	OTHER = 3,
}

export enum ItemStatus {
	INACTIVE = 0,
	ACTIVE = 1,
}

export interface Item {
	id: string
	item_name: string
	item_category: ItemCategory
	item_price_cents: number
	item_description: string | null
	item_status: ItemStatus
	created_at: number
	updated_at: number
	created_by: string
	updated_by: string
}

export interface ItemWithPrice extends Item {
	price_display: string
}

// Constants
export const ID_PREFIX = 'ITEM'
export const ITEMS_PER_PAGE = 10
