import { z } from 'zod'

// Constants
export const CUSTOMERS_PER_PAGE = 20

// Customer schemas
export const createCustomerSchema = z.object({
	contact_company_name: z.string().min(1).max(255),
	contact_phone: z.string().min(1),
	contact_name: z.string().min(1),
	contact_email: z.string().email().nullable().optional(),
	status: z.literal(0).or(z.literal(1)).optional().default(1),
})

export const createCustomerWithDetailsSchema = z.object({
	contact_company_name: z.string().min(1).max(255),
	contact_phone: z.string().min(1),
	contact_name: z.string().min(1),
	contact_email: z.string().email().nullable().optional(),
	status: z.literal(0).or(z.literal(1)).optional().default(1),
	contacts: z
		.array(
			z.object({
				contact_phone: z.string().min(1),
				contact_name: z.string().min(1),
				contact_email: z.string().email().nullable().optional(),
				is_primary: z.literal(0).or(z.literal(1)).optional().default(0),
			}),
		)
		.optional(),
	billing_address: z
		.object({
			address_label: z.string().nullable().optional(),
			address_line1: z.string().min(1),
			address_line2: z.string().nullable().optional(),
			address_line3: z.string().nullable().optional(),
			address_line4: z.string().nullable().optional(),
			postcode: z.string().nullable().optional(),
			city: z.string().nullable().optional(),
			state: z.string().nullable().optional(),
			country: z.string().nullable().optional(),
		})
		.optional(),
	shipping_address: z
		.object({
			address_label: z.string().nullable().optional(),
			address_line1: z.string().min(1),
			address_line2: z.string().nullable().optional(),
			address_line3: z.string().nullable().optional(),
			address_line4: z.string().nullable().optional(),
			postcode: z.string().nullable().optional(),
			city: z.string().nullable().optional(),
			state: z.string().nullable().optional(),
			country: z.string().nullable().optional(),
		})
		.optional(),
})

export const updateCustomerSchema = z.object({
	id: z.string(),
	contact_company_name: z.string().min(1).max(255).optional(),
	contact_phone: z.string().min(1).optional(),
	contact_name: z.string().min(1).optional(),
	contact_email: z.string().email().nullable().optional(),
	status: z.literal(0).or(z.literal(1)).optional(),
})

export const listCustomersSchema = z.object({
	page: z.number().int().min(1).default(1),
	status: z.literal(0).or(z.literal(1)).optional(),
	search: z.string().optional(),
})

export const listAllCustomersSchema = z.object({
	status: z.literal(0).or(z.literal(1)).optional(),
})

// Contact schemas
export const createContactSchema = z.object({
	customer_id: z.string(),
	contact_phone: z.string().min(1),
	contact_name: z.string().min(1),
	contact_email: z.string().email().nullable().optional(),
	is_primary: z.literal(0).or(z.literal(1)).optional().default(0),
})

export const updateContactSchema = z.object({
	id: z.string(),
	contact_phone: z.string().min(1).optional(),
	contact_name: z.string().min(1).optional(),
	contact_email: z.string().email().nullable().optional(),
	is_primary: z.literal(0).or(z.literal(1)).optional(),
})

// Address schemas
export const createAddressSchema = z.object({
	customer_id: z.string(),
	address_type: z.enum(['billing', 'shipping']),
	address_label: z.string().nullable().optional(),
	address_line1: z.string().nullable().optional(),
	address_line2: z.string().nullable().optional(),
	address_line3: z.string().nullable().optional(),
	address_line4: z.string().nullable().optional(),
	postcode: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	state: z.string().nullable().optional(),
	country: z.string().nullable().optional(),
	is_default: z.literal(0).or(z.literal(1)).optional().default(0),
})

export const updateAddressSchema = z.object({
	id: z.string(),
	address_type: z.enum(['billing', 'shipping']).optional(),
	address_label: z.string().nullable().optional(),
	address_line1: z.string().nullable().optional(),
	address_line2: z.string().nullable().optional(),
	address_line3: z.string().nullable().optional(),
	address_line4: z.string().nullable().optional(),
	postcode: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	state: z.string().nullable().optional(),
	country: z.string().nullable().optional(),
	is_default: z.literal(0).or(z.literal(1)).optional(),
})
