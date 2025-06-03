import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import type { CustomerContact } from '@/shared/customer'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

interface ContactListProps {
	customerId: string
}

export function ContactList({ customerId }: ContactListProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	// Get customer data to display name
	const { data: customer } = trpc.customers.getById.useQuery(customerId)

	// Get contacts - we already have them from the customer query
	const contacts = customer?.contacts || []

	const [isUpdating, setIsUpdating] = useState<string | null>(null)

	// Mutations
	const updateContactMutation = trpc.customers.updateContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
		},
	})

	const deleteMutation = trpc.customers.removeContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
		},
	})

	const handleSetPrimary = async (contact: CustomerContact) => {
		if (contact.is_primary === 1) return

		setIsUpdating(contact.id)
		try {
			// First, unset current primary
			const currentPrimary = contacts.find((c) => c.is_primary === 1)
			if (currentPrimary) {
				await updateContactMutation.mutateAsync({
					id: currentPrimary.id,
					is_primary: 0,
				})
			}

			// Then set new primary
			await updateContactMutation.mutateAsync({
				id: contact.id,
				is_primary: 1,
			})
		} finally {
			setIsUpdating(null)
		}
	}

	const handleDelete = async (contactId: string) => {
		if (!confirm('Are you sure you want to delete this contact?')) return

		setIsUpdating(contactId)
		try {
			await deleteMutation.mutateAsync(contactId)
		} finally {
			setIsUpdating(null)
		}
	}

	const isLoading = !customer
	const isProcessing = isUpdating !== null

	return (
		<div>
			<div className="content-header">
				<h1>Manage Contacts</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/customers/$customerId" params={{ customerId }}>
							← Back to {customer?.customer_name || 'Customer'}
						</Link>
					</div>
					<div>
						{hasPermission('customers', 'update-any') && (
							<button
								className="button-primary"
								type="button"
								onClick={() =>
									navigate({
										to: '/customers/$customerId/contacts/create',
										params: { customerId },
									})
								}
							>
								Add Contact
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isLoading || isProcessing} />

					<div className="contact-section">
						<h2>Phone Contacts</h2>
						{contacts.length === 0 ? (
							<p className="no-data">No contacts found</p>
						) : (
							<div className="contact-list">
								<table className="data-table">
									<thead>
										<tr>
											<th>Phone Number</th>
											<th>Label</th>
											<th>Primary</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{contacts.map((contact) => (
											<tr key={contact.id}>
												<td>{contact.phone_number}</td>
												<td>{contact.phone_label || '-'}</td>
												<td>
													{contact.is_primary === 1 ? (
														<span className="badge-primary">Primary</span>
													) : (
														'-'
													)}
												</td>
												<td>
													<div className="button-group">
														<button
															className="button-small"
															type="button"
															onClick={() =>
																navigate({
																	to: '/customers/$customerId/contacts/$contactId/edit',
																	params: {
																		customerId,
																		contactId: contact.id,
																	},
																})
															}
															disabled={isUpdating === contact.id}
														>
															Edit
														</button>
														{contact.is_primary !== 1 && (
															<button
																className="button-small"
																type="button"
																onClick={() => handleSetPrimary(contact)}
																disabled={isUpdating === contact.id}
															>
																Set Primary
															</button>
														)}
														<button
															className="button-small button-danger"
															type="button"
															onClick={() => handleDelete(contact.id)}
															disabled={
																isUpdating === contact.id ||
																contact.is_primary === 1
															}
															title={
																contact.is_primary === 1
																	? 'Cannot delete primary contact'
																	: ''
															}
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
