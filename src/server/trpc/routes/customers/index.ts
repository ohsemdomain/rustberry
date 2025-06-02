import {
	hasPermission,
	permissionProcedure,
} from '@/server/trpc/middleware/auth'
import { router } from '@/server/trpc/trpc-instance'
import { generateUniqueId } from '@/server/trpc/utils/id-generator'
import {
	CUSTOMER_ID_PREFIX,
	ADDRESS_ID_PREFIX,
	CONTACT_ID_PREFIX,
	type Customer,
	type CustomerAddress,
	type CustomerContact,
} from '@/shared/customer'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const CUSTOMERS_PER_PAGE = 20

// Zod schemas for validation
const createCustomerSchema = z.object({
	customer_name: z.string().min(1).max(255),
	customer_email: z.string().email().nullable().optional(),
	status: z.literal(0).or(z.literal(1)).optional().default(1),
})

const updateCustomerSchema = z.object({
	id: z.string(),
	customer_name: z.string().min(1).max(255).optional(),
	customer_email: z.string().email().nullable().optional(),
	status: z.literal(0).or(z.literal(1)).optional(),
})

const listCustomersSchema = z.object({
	page: z.number().int().min(1).default(1),
	status: z.literal(0).or(z.literal(1)).optional(),
	search: z.string().optional(),
})

const createContactSchema = z.object({
	customer_id: z.string(),
	phone_number: z.string().min(1),
	phone_label: z.string().nullable().optional(),
	is_primary: z.literal(0).or(z.literal(1)).optional().default(0),
})

const updateContactSchema = z.object({
	id: z.string(),
	phone_number: z.string().min(1).optional(),
	phone_label: z.string().nullable().optional(),
	is_primary: z.literal(0).or(z.literal(1)).optional(),
})

const createAddressSchema = z.object({
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

const updateAddressSchema = z.object({
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

export const customersRouter = router({
	// Create customer
	create: permissionProcedure('customers', 'create')
		.input(createCustomerSchema)
		.mutation(async ({ input, ctx }) => {
			const id = await generateUniqueId(ctx.env, CUSTOMER_ID_PREFIX, 'customer')
			const now = Date.now()

			const customer: Customer = {
				id,
				customer_name: input.customer_name,
				customer_email: input.customer_email || null,
				status: input.status || 1,
				created_at: now,
				updated_at: now,
				created_by: ctx.user.id,
				updated_by: ctx.user.id,
			}

			try {
				await ctx.env.DB.prepare(
					`INSERT INTO customers (
						id, customer_name, customer_email, status,
						created_at, updated_at, created_by, updated_by
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						customer.id,
						customer.customer_name,
						customer.customer_email,
						customer.status,
						customer.created_at,
						customer.updated_at,
						customer.created_by,
						customer.updated_by,
					)
					.run()

				return customer
			} catch (error) {
				console.error('Failed to create customer:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create customer',
				})
			}
		}),

	// List customers
	list: permissionProcedure('customers', 'read')
		.input(listCustomersSchema)
		.query(async ({ input, ctx }) => {
			const { page = 1, status, search } = input
			const offset = (page - 1) * CUSTOMERS_PER_PAGE

			let query = 'SELECT * FROM customers WHERE 1=1'
			const params: unknown[] = []

			// Filter by status
			if (status !== undefined) {
				query += ' AND status = ?'
				params.push(status)
			}

			// Search by name
			if (search) {
				query += ' AND customer_name LIKE ?'
				params.push(`%${search}%`)
			}

			// Order and pagination
			query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
			params.push(CUSTOMERS_PER_PAGE, offset)

			try {
				// Get customers
				const { results } = await ctx.env.DB.prepare(query)
					.bind(...params)
					.all<Customer>()

				// Get total count
				let countQuery = 'SELECT COUNT(*) as count FROM customers WHERE 1=1'
				const countParams: unknown[] = []

				if (status !== undefined) {
					countQuery += ' AND status = ?'
					countParams.push(status)
				}

				if (search) {
					countQuery += ' AND customer_name LIKE ?'
					countParams.push(`%${search}%`)
				}

				const { results: countResult } = await ctx.env.DB.prepare(countQuery)
					.bind(...countParams)
					.all<{ count: number }>()

				const totalItems = countResult[0]?.count || 0
				const totalPages = Math.ceil(totalItems / CUSTOMERS_PER_PAGE)

				return {
					customers: results,
					totalItems,
					totalPages,
					currentPage: page,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				}
			} catch (error) {
				console.error('Failed to list customers:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to list customers',
				})
			}
		}),

	// Search customers by phone
	searchByPhone: permissionProcedure('customers', 'read')
		.input(z.string())
		.query(async ({ input: phoneNumber, ctx }) => {
			try {
				// Search in customer_contacts table
				const { results } = await ctx.env.DB.prepare(
					`SELECT DISTINCT c.* 
					FROM customers c
					INNER JOIN customer_contacts cc ON c.id = cc.customer_id
					WHERE cc.phone_number LIKE ?
					ORDER BY c.customer_name`,
				)
					.bind(`%${phoneNumber}%`)
					.all<Customer>()

				return results
			} catch (error) {
				console.error('Failed to search customers by phone:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to search customers',
				})
			}
		}),

	// Get customer by ID
	getById: permissionProcedure('customers', 'read')
		.input(z.string())
		.query(async ({ input, ctx }) => {
			try {
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM customers WHERE id = ?',
				)
					.bind(input)
					.all<Customer>()

				const customer = results[0]
				if (!customer) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Customer not found',
					})
				}

				// Get contacts
				const { results: contacts } = await ctx.env.DB.prepare(
					'SELECT * FROM customer_contacts WHERE customer_id = ? ORDER BY is_primary DESC, created_at',
				)
					.bind(input)
					.all<CustomerContact>()

				// Get addresses
				const { results: addresses } = await ctx.env.DB.prepare(
					'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY address_type, is_default DESC, created_at',
				)
					.bind(input)
					.all<CustomerAddress>()

				return {
					...customer,
					contacts,
					addresses,
				}
			} catch (error) {
				if (error instanceof TRPCError) throw error

				console.error('Failed to get customer:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to get customer',
				})
			}
		}),

	// Update customer
	update: permissionProcedure('customers', 'update-any')
		.input(updateCustomerSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updates } = input

			// First, get the existing customer
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM customers WHERE id = ?',
			)
				.bind(id)
				.all<Customer>()

			const existingCustomer = results[0]
			if (!existingCustomer) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			// Check ownership-based permissions
			const canUpdate =
				hasPermission(ctx.user, 'customers', 'update-any') ||
				hasPermission(ctx.user, 'customers', 'update-own', existingCustomer)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this customer',
				})
			}

			const updateFields: string[] = []
			const updateValues: unknown[] = []

			// Build dynamic update query
			if (updates.customer_name !== undefined) {
				updateFields.push('customer_name = ?')
				updateValues.push(updates.customer_name)
			}
			if (updates.customer_email !== undefined) {
				updateFields.push('customer_email = ?')
				updateValues.push(updates.customer_email)
			}
			if (updates.status !== undefined) {
				updateFields.push('status = ?')
				updateValues.push(updates.status)
			}

			// Always update these fields
			updateFields.push('updated_at = ?', 'updated_by = ?')
			updateValues.push(Date.now(), ctx.user.id)

			// Add ID for WHERE clause
			updateValues.push(id)

			try {
				await ctx.env.DB.prepare(
					`UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`,
				)
					.bind(...updateValues)
					.run()

				// Get updated customer
				const { results } = await ctx.env.DB.prepare(
					'SELECT * FROM customers WHERE id = ?',
				)
					.bind(id)
					.all<Customer>()

				return results[0]
			} catch (error) {
				console.error('Failed to update customer:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update customer',
				})
			}
		}),

	// Delete customer (soft delete)
	delete: permissionProcedure('customers', 'delete-any')
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			// First, get the existing customer
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM customers WHERE id = ?',
			)
				.bind(id)
				.all<Customer>()

			const existingCustomer = results[0]
			if (!existingCustomer) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			// Check ownership-based permissions
			const canDelete =
				hasPermission(ctx.user, 'customers', 'delete-any') ||
				hasPermission(ctx.user, 'customers', 'delete-own', existingCustomer)

			if (!canDelete) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to delete this customer',
				})
			}

			try {
				// Soft delete by setting status to inactive
				await ctx.env.DB.prepare(
					`UPDATE customers SET 
						status = ?, 
						updated_at = ?, 
						updated_by = ? 
					WHERE id = ?`,
				)
					.bind(0, Date.now(), ctx.user.id, id)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to delete customer:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete customer',
				})
			}
		}),

	// Contact management
	addContact: permissionProcedure('customers', 'update-any')
		.input(createContactSchema)
		.mutation(async ({ input, ctx }) => {
			// Verify customer exists
			const { results } = await ctx.env.DB.prepare(
				'SELECT id FROM customers WHERE id = ?',
			)
				.bind(input.customer_id)
				.all()

			if (results.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			const id = await generateUniqueId(ctx.env, CONTACT_ID_PREFIX, 'customer_contact')
			const now = Date.now()

			// If setting as primary, unset other primary contacts
			if (input.is_primary === 1) {
				await ctx.env.DB.prepare(
					'UPDATE customer_contacts SET is_primary = 0 WHERE customer_id = ?',
				)
					.bind(input.customer_id)
					.run()
			}

			const contact: CustomerContact = {
				id,
				customer_id: input.customer_id,
				phone_number: input.phone_number,
				phone_label: input.phone_label || null,
				is_primary: input.is_primary || 0,
				created_at: now,
			}

			try {
				await ctx.env.DB.prepare(
					`INSERT INTO customer_contacts (
						id, customer_id, phone_number, phone_label, is_primary, created_at
					) VALUES (?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						contact.id,
						contact.customer_id,
						contact.phone_number,
						contact.phone_label,
						contact.is_primary,
						contact.created_at,
					)
					.run()

				return contact
			} catch (error) {
				console.error('Failed to add contact:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to add contact',
				})
			}
		}),

	updateContact: permissionProcedure('customers', 'update-any')
		.input(updateContactSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updates } = input

			// Get existing contact
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM customer_contacts WHERE id = ?',
			)
				.bind(id)
				.all<CustomerContact>()

			if (results.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Contact not found',
				})
			}

			const contact = results[0]

			// If setting as primary, unset other primary contacts
			if (updates.is_primary === 1) {
				await ctx.env.DB.prepare(
					'UPDATE customer_contacts SET is_primary = 0 WHERE customer_id = ? AND id != ?',
				)
					.bind(contact.customer_id, id)
					.run()
			}

			const updateFields: string[] = []
			const updateValues: unknown[] = []

			if (updates.phone_number !== undefined) {
				updateFields.push('phone_number = ?')
				updateValues.push(updates.phone_number)
			}
			if (updates.phone_label !== undefined) {
				updateFields.push('phone_label = ?')
				updateValues.push(updates.phone_label)
			}
			if (updates.is_primary !== undefined) {
				updateFields.push('is_primary = ?')
				updateValues.push(updates.is_primary)
			}

			updateValues.push(id)

			try {
				await ctx.env.DB.prepare(
					`UPDATE customer_contacts SET ${updateFields.join(', ')} WHERE id = ?`,
				)
					.bind(...updateValues)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to update contact:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update contact',
				})
			}
		}),

	removeContact: permissionProcedure('customers', 'update-any')
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			try {
				await ctx.env.DB.prepare('DELETE FROM customer_contacts WHERE id = ?')
					.bind(id)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to remove contact:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to remove contact',
				})
			}
		}),

	// Address management
	addAddress: permissionProcedure('customers', 'update-any')
		.input(createAddressSchema)
		.mutation(async ({ input, ctx }) => {
			// Verify customer exists
			const { results } = await ctx.env.DB.prepare(
				'SELECT id FROM customers WHERE id = ?',
			)
				.bind(input.customer_id)
				.all()

			if (results.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			const id = await generateUniqueId(ctx.env, ADDRESS_ID_PREFIX, 'customer_address')
			const now = Date.now()

			// If setting as default, unset other defaults of same type
			if (input.is_default === 1) {
				await ctx.env.DB.prepare(
					'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND address_type = ?',
				)
					.bind(input.customer_id, input.address_type)
					.run()
			}

			const address: CustomerAddress = {
				id,
				customer_id: input.customer_id,
				address_type: input.address_type,
				address_label: input.address_label || null,
				address_line1: input.address_line1 || null,
				address_line2: input.address_line2 || null,
				address_line3: input.address_line3 || null,
				address_line4: input.address_line4 || null,
				postcode: input.postcode || null,
				city: input.city || null,
				state: input.state || null,
				country: input.country || null,
				is_default: input.is_default || 0,
				created_at: now,
				updated_at: now,
			}

			try {
				await ctx.env.DB.prepare(
					`INSERT INTO customer_addresses (
						id, customer_id, address_type, address_label, address_line1,
						address_line2, address_line3, address_line4, postcode, city,
						state, country, is_default, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						address.id,
						address.customer_id,
						address.address_type,
						address.address_label,
						address.address_line1,
						address.address_line2,
						address.address_line3,
						address.address_line4,
						address.postcode,
						address.city,
						address.state,
						address.country,
						address.is_default,
						address.created_at,
						address.updated_at,
					)
					.run()

				return address
			} catch (error) {
				console.error('Failed to add address:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to add address',
				})
			}
		}),

	updateAddress: permissionProcedure('customers', 'update-any')
		.input(updateAddressSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updates } = input

			// Get existing address
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM customer_addresses WHERE id = ?',
			)
				.bind(id)
				.all<CustomerAddress>()

			if (results.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Address not found',
				})
			}

			const address = results[0]

			// If setting as default, unset other defaults of same type
			if (updates.is_default === 1) {
				const addressType = updates.address_type || address.address_type
				await ctx.env.DB.prepare(
					'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND address_type = ? AND id != ?',
				)
					.bind(address.customer_id, addressType, id)
					.run()
			}

			const updateFields: string[] = []
			const updateValues: unknown[] = []

			// Build update query for all possible fields
			const fieldsToUpdate = [
				'address_type', 'address_label', 'address_line1', 'address_line2',
				'address_line3', 'address_line4', 'postcode', 'city', 'state',
				'country', 'is_default'
			]

			for (const field of fieldsToUpdate) {
				if (updates[field as keyof typeof updates] !== undefined) {
					updateFields.push(`${field} = ?`)
					updateValues.push(updates[field as keyof typeof updates])
				}
			}

			// Always update updated_at
			updateFields.push('updated_at = ?')
			updateValues.push(Date.now())

			updateValues.push(id)

			try {
				await ctx.env.DB.prepare(
					`UPDATE customer_addresses SET ${updateFields.join(', ')} WHERE id = ?`,
				)
					.bind(...updateValues)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to update address:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update address',
				})
			}
		}),

	removeAddress: permissionProcedure('customers', 'update-any')
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			try {
				await ctx.env.DB.prepare('DELETE FROM customer_addresses WHERE id = ?')
					.bind(id)
					.run()

				return { success: true }
			} catch (error) {
				console.error('Failed to remove address:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to remove address',
				})
			}
		}),
})