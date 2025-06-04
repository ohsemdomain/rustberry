// Follow pattern from src/shared/items.ts

export interface Customer {
	id: string
	contact_company_name: string
	contact_phone: string
	contact_name: string
	contact_email: string | null
	status: 0 | 1
	created_at: number
	updated_at: number
	created_by: string
	updated_by: string
}

export interface CustomerAddress {
	id: string
	customer_id: string
	address_type: 'billing' | 'shipping'
	address_label: string | null
	address_line1: string | null
	address_line2: string | null
	address_line3: string | null
	address_line4: string | null
	postcode: string | null
	city: string | null
	state: string | null
	country: string | null
	is_default: 0 | 1
	created_at: number
	updated_at: number
}

export interface CustomerContact {
	id: string
	customer_id: string
	contact_phone: string
	contact_name: string
	contact_email: string | null
	is_primary: 0 | 1
	created_at: number
}

export const CUSTOMER_ID_PREFIX = 'CUST'
export const ADDRESS_ID_PREFIX = 'ADDR'
export const CONTACT_ID_PREFIX = 'CONT'
