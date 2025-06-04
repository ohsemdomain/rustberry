import {
	hasPermission,
	permissionProcedure,
} from '@/server/trpc/middleware/auth'
import { router } from '@/server/trpc/trpc-instance'
import { generateUniqueId } from '@/server/trpc/utils/id-generator'
import {
	ADDRESS_ID_PREFIX,
	CONTACT_ID_PREFIX,
	CUSTOMER_ID_PREFIX,
	type Customer,
	type CustomerAddress,
	type CustomerContact,
} from '@/shared/customer'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
	CUSTOMERS_PER_PAGE,
	createCustomerSchema,
	createCustomerWithDetailsSchema,
	listAllCustomersSchema,
	listCustomersSchema,
	updateCustomerSchema,
} from './schemas'

export const coreRouter = router({
	// Create customer
	create: permissionProcedure('customers', 'create')
		.input(createCustomerSchema)
		.mutation(async ({ input, ctx }) => {
			const id = await generateUniqueId(ctx.env, CUSTOMER_ID_PREFIX, 'customer')
			const now = Date.now()

			const customer: Customer = {
				id,
				contact_company_name: input.contact_company_name,
				contact_email: input.contact_email || null,
				contact_phone: input.contact_phone,
				contact_name: input.contact_name,
				status: input.status || 1,
				created_at: now,
				updated_at: now,
				created_by: ctx.user.id,
				updated_by: ctx.user.id,
			}

			try {
				await ctx.env.DB.prepare(
					`INSERT INTO customers (
						id, contact_company_name, contact_email, contact_phone, contact_name, status,
						created_at, updated_at, created_by, updated_by
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						customer.id,
						customer.contact_company_name,
						customer.contact_email,
						customer.contact_phone,
						customer.contact_name,
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

	// Create customer with all details in one transaction
	createWithDetails: permissionProcedure('customers', 'create')
		.input(createCustomerWithDetailsSchema)
		.mutation(async ({ input, ctx }) => {
			const customerId = await generateUniqueId(
				ctx.env,
				CUSTOMER_ID_PREFIX,
				'customer',
			)
			const now = Date.now()

			const customer: Customer = {
				id: customerId,
				contact_company_name: input.contact_company_name,
				contact_email: input.contact_email || null,
				contact_phone: input.contact_phone,
				contact_name: input.contact_name,
				status: input.status || 1,
				created_at: now,
				updated_at: now,
				created_by: ctx.user.id,
				updated_by: ctx.user.id,
			}

			try {
				// Start by creating the customer
				await ctx.env.DB.prepare(
					`INSERT INTO customers (
						id, contact_company_name, contact_email, contact_phone, contact_name, status,
						created_at, updated_at, created_by, updated_by
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						customer.id,
						customer.contact_company_name,
						customer.contact_email,
						customer.contact_phone,
						customer.contact_name,
						customer.status,
						customer.created_at,
						customer.updated_at,
						customer.created_by,
						customer.updated_by,
					)
					.run()

				// Add contacts if provided
				if (input.contacts && input.contacts.length > 0) {
					// Ensure only one primary contact
					let hasPrimary = false
					for (const contact of input.contacts) {
						if (contact.is_primary === 1) {
							if (hasPrimary) {
								contact.is_primary = 0
							} else {
								hasPrimary = true
							}
						}
					}

					// Insert all contacts
					for (const contact of input.contacts) {
						const contactId = await generateUniqueId(
							ctx.env,
							CONTACT_ID_PREFIX,
							'customer_contact',
						)

						await ctx.env.DB.prepare(
							`INSERT INTO customer_contacts (
								id, customer_id, contact_phone, contact_name, contact_email, is_primary, created_at
							) VALUES (?, ?, ?, ?, ?, ?, ?)`,
						)
							.bind(
								contactId,
								customerId,
								contact.contact_phone,
								contact.contact_name || null,
								contact.contact_email || null,
								contact.is_primary || 0,
								now,
							)
							.run()
					}
				}

				// Add billing address if provided
				if (input.billing_address) {
					const billingAddressId = await generateUniqueId(
						ctx.env,
						ADDRESS_ID_PREFIX,
						'customer_address',
					)

					await ctx.env.DB.prepare(
						`INSERT INTO customer_addresses (
							id, customer_id, address_type, address_label, address_line1,
							address_line2, address_line3, address_line4, postcode, city,
							state, country, is_default, created_at, updated_at
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					)
						.bind(
							billingAddressId,
							customerId,
							'billing',
							input.billing_address.address_label || null,
							input.billing_address.address_line1,
							input.billing_address.address_line2 || null,
							input.billing_address.address_line3 || null,
							input.billing_address.address_line4 || null,
							input.billing_address.postcode || null,
							input.billing_address.city || null,
							input.billing_address.state || null,
							input.billing_address.country || null,
							1, // is_default
							now,
							now,
						)
						.run()
				}

				// Add shipping address if provided
				if (input.shipping_address) {
					const shippingAddressId = await generateUniqueId(
						ctx.env,
						ADDRESS_ID_PREFIX,
						'customer_address',
					)

					await ctx.env.DB.prepare(
						`INSERT INTO customer_addresses (
							id, customer_id, address_type, address_label, address_line1,
							address_line2, address_line3, address_line4, postcode, city,
							state, country, is_default, created_at, updated_at
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					)
						.bind(
							shippingAddressId,
							customerId,
							'shipping',
							input.shipping_address.address_label || null,
							input.shipping_address.address_line1,
							input.shipping_address.address_line2 || null,
							input.shipping_address.address_line3 || null,
							input.shipping_address.address_line4 || null,
							input.shipping_address.postcode || null,
							input.shipping_address.city || null,
							input.shipping_address.state || null,
							input.shipping_address.country || null,
							1, // is_default
							now,
							now,
						)
						.run()
				}

				return customer
			} catch (error) {
				// If any operation fails, we should ideally rollback
				// Since D1 doesn't support transactions yet, we'll just log and throw
				console.error('Failed to create customer with details:', error)

				// Try to clean up the customer if it was created
				try {
					await ctx.env.DB.prepare('DELETE FROM customers WHERE id = ?')
						.bind(customerId)
						.run()
				} catch (cleanupError) {
					console.error('Failed to cleanup customer:', cleanupError)
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create customer with details',
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

			// Search by company name
			if (search) {
				query += ' AND contact_company_name LIKE ?'
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
					countQuery += ' AND contact_company_name LIKE ?'
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

	// List ALL customers for client-side filtering
	listAll: permissionProcedure('customers', 'read')
		.input(listAllCustomersSchema)
		.query(async ({ input, ctx }) => {
			const { status } = input

			let query = 'SELECT * FROM customers WHERE 1=1'
			const params: unknown[] = []

			// Filter by status only (no search, no pagination)
			if (status !== undefined) {
				query += ' AND status = ?'
				params.push(status)
			}

			// Order by latest activity (newest updates or creates first)
			// In SQLite/D1, we use CASE to get the maximum of two values
			query +=
				' ORDER BY CASE WHEN updated_at > created_at THEN updated_at ELSE created_at END DESC'

			try {
				// Get ALL customers for the current status filter
				const { results } = await ctx.env.DB.prepare(query)
					.bind(...params)
					.all<Customer>()

				// Get total count (same as results length since we're getting all)
				const totalCustomers = results.length

				return {
					customers: results,
					totalCustomers,
				}
			} catch (error) {
				console.error('Failed to list all customers:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to list all customers',
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
					WHERE cc.contact_phone LIKE ?
					ORDER BY c.contact_company_name`,
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
			if (updates.contact_company_name !== undefined) {
				updateFields.push('contact_company_name = ?')
				updateValues.push(updates.contact_company_name)
			}
			if (updates.contact_email !== undefined) {
				updateFields.push('contact_email = ?')
				updateValues.push(updates.contact_email)
			}
			if (updates.contact_phone !== undefined) {
				updateFields.push('contact_phone = ?')
				updateValues.push(updates.contact_phone)
			}
			if (updates.contact_name !== undefined) {
				updateFields.push('contact_name = ?')
				updateValues.push(updates.contact_name)
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
})
