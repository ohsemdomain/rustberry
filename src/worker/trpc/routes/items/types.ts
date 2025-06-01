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

export enum ItemCategory {
	PACKAGING = 1,
	LABEL = 2,
	OTHER = 3,
}

export enum ItemStatus {
	INACTIVE = 0,
	ACTIVE = 1,
}

export interface CreateItemInput {
	item_name: string
	item_category: ItemCategory
	item_price_cents: number
	item_description?: string
	item_status?: ItemStatus
}

export interface UpdateItemInput {
	id: string
	item_name?: string
	item_category?: ItemCategory
	item_price_cents?: number
	item_description?: string | null
	item_status?: ItemStatus
}

export interface ItemsFilter {
	status?: ItemStatus
	search?: string
}

export interface PaginationParams {
	page: number
	limit: number
}

// Item with display fields (returned from API)
export interface ItemWithDisplay extends Item {
	price_display: string
}

export interface PaginatedItems {
	items: ItemWithDisplay[]
	totalCount: number
	currentPage: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

// ID configuration
export const ID_PREFIX = 'ITEM'
export const ITEMS_PER_PAGE = 50