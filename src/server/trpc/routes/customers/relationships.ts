import {
	hasPermission,
	permissionProcedure,
} from '@/server/trpc/middleware/auth'
import { router } from '@/server/trpc/trpc-instance'
import { generateUniqueId } from '@/server/trpc/utils/id-generator'
import {
	ADDRESS_ID_PREFIX,
	CONTACT_ID_PREFIX,
	type Customer,
	type CustomerAddress,
	type CustomerContact,
} from '@/shared/customer'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
	createAddressSchema,
	createContactSchema,
	updateAddressSchema,
	updateContactSchema,
} from './schemas'

export const relationshipsRouter = router({
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

			const id = await generateUniqueId(
				ctx.env,
				CONTACT_ID_PREFIX,
				'customer_contact',
			)
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
	addAddress: permissionProcedure('customers', 'read')
		.input(createAddressSchema)
		.mutation(async ({ input, ctx }) => {
			// Verify customer exists and check permissions
			const { results } = await ctx.env.DB.prepare(
				'SELECT * FROM customers WHERE id = ?',
			)
				.bind(input.customer_id)
				.all<Customer>()

			const customer = results[0]
			if (!customer) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			// Check if user can update this customer
			const canUpdate =
				hasPermission(ctx.user, 'customers', 'update-any') ||
				hasPermission(ctx.user, 'customers', 'update-own', customer)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this customer',
				})
			}

			const id = await generateUniqueId(
				ctx.env,
				ADDRESS_ID_PREFIX,
				'customer_address',
			)
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

	updateAddress: permissionProcedure('customers', 'read')
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

			// Get the customer to check permissions
			const { results: customerResults } = await ctx.env.DB.prepare(
				'SELECT * FROM customers WHERE id = ?',
			)
				.bind(address.customer_id)
				.all<Customer>()

			const customer = customerResults[0]
			if (!customer) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			// Check if user can update this customer
			const canUpdate =
				hasPermission(ctx.user, 'customers', 'update-any') ||
				hasPermission(ctx.user, 'customers', 'update-own', customer)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this customer',
				})
			}

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
				'address_type',
				'address_label',
				'address_line1',
				'address_line2',
				'address_line3',
				'address_line4',
				'postcode',
				'city',
				'state',
				'country',
				'is_default',
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

	removeAddress: permissionProcedure('customers', 'read')
		.input(z.string())
		.mutation(async ({ input: id, ctx }) => {
			// Get the address first to check customer
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

			// Get the customer to check permissions
			const { results: customerResults } = await ctx.env.DB.prepare(
				'SELECT * FROM customers WHERE id = ?',
			)
				.bind(address.customer_id)
				.all<Customer>()

			const customer = customerResults[0]
			if (!customer) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Customer not found',
				})
			}

			// Check if user can update this customer
			const canUpdate =
				hasPermission(ctx.user, 'customers', 'update-any') ||
				hasPermission(ctx.user, 'customers', 'update-own', customer)

			if (!canUpdate) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to update this customer',
				})
			}

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
