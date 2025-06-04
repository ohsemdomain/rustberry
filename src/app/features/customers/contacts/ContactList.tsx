//src/app/features/customers/contacts/ContactList.tsx
import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatDate } from '@/app/utils/date'
import type { CustomerContact } from '@/shared/customer'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus, User } from 'lucide-react'
import { useMemo, useState } from 'react'

interface ContactListProps {
	customerId: string
}

export function ContactList({ customerId }: ContactListProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	const [displayedCount, setDisplayedCount] = useState(20)

	// Get customer data to display name
	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	// Get contacts - we already have them from the customer query
	const contacts = customer?.contacts || []

	const [isUpdating, setIsUpdating] = useState<string | null>(null)

	// Find primary contact
	const primaryContact = useMemo(() => {
		return contacts.find((c) => c.is_primary === 1)
	}, [contacts])

	// Non-primary contacts for the list
	const nonPrimaryContacts = useMemo(() => {
		return contacts.filter((c) => c.is_primary !== 1)
	}, [contacts])

	// Contacts to display (with pagination)
	const displayedContacts = useMemo(() => {
		return nonPrimaryContacts.slice(0, displayedCount)
	}, [nonPrimaryContacts, displayedCount])

	const handleLoadMore = () => {
		setDisplayedCount((prev) => prev + 20)
	}

	const hasMoreToLoad = displayedCount < nonPrimaryContacts.length

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

	const handleAddContact = () => {
		navigate({
			to: '/customers/$customerId/contacts/create',
			params: { customerId },
		})
	}

	// Show error without layout
	if (error) {
		return (
			<div className="component-wrapper">
				<div className="content-header">
					<h1>Manage Contacts</h1>
				</div>
				<div className="content-body">
					<div style={{ padding: '2rem', textAlign: 'center' }}>
						Error: {error.message}
					</div>
				</div>
			</div>
		)
	}

	const isProcessing = isUpdating !== null

	return (
		<div>
			<div className="content-header">
				<h1>Manage Contacts</h1>
				<div>
					<Link to="/customers/$customerId" params={{ customerId }}>
						← Back to customer detail
					</Link>
				</div>
			</div>

			<div className="content-body">
				<div className="contact-cards-section">
					{/* Primary Contact Card */}
					<div className="contact-card primary-card">
						<div className="contact-card-icon">
							<User size={24} />
						</div>
						<div className="contact-card-content">
							<h3 className="contact-card-title">Primary Contact</h3>
							{primaryContact ? (
								<>
									<p className="contact-card-phone">
										{primaryContact.phone_number}
									</p>
									<p className="contact-card-label">
										{formatDate(primaryContact.created_at)} • {primaryContact.phone_label || 'No label'}
									</p>
									<div className="contact-card-actions">
										<Link
											to="/customers/$customerId/contacts/$contactId/edit"
											params={{
												customerId,
												contactId: primaryContact.id,
											}}
											className="contact-card-link"
										>
											Edit
										</Link>
									</div>
								</>
							) : (
								<p className="contact-card-empty">No primary contact set</p>
							)}
						</div>
					</div>

					{/* Add Contact Card */}
					{hasPermission('customers', 'update-any') && (
						<button
							className="contact-card add-contact-card"
							onClick={handleAddContact}
							type="button"
						>
							<div className="add-contact-icon">
								<Plus size={32} />
							</div>
							<p className="add-contact-text">Add New Contact</p>
						</button>
					)}
				</div>

				<div className="scroll-container">
					{(isLoading || isProcessing) && <LoadingOverlay isLoading={true} />}
					{nonPrimaryContacts.length === 0 && !isLoading ? (
						<div className="list-empty">No additional contacts found</div>
					) : (
						<>
							<div className="contact-list-header">
								<h3>Other Contacts</h3>
							</div>
							{displayedContacts.map((contact) => (
								<div key={contact.id} className="list-item">
									{/* Left side - Contact info */}
									<div className="list-item-content">
										<div className="list-item-info">
											<div className="list-item-title">
												{contact.phone_number}
											</div>
											<div className="list-item-meta">
												{formatDate(contact.created_at)} • {contact.phone_label || 'No label'}
											</div>
										</div>
									</div>

									{/* Right side - Actions */}
									<div className="list-item-links">
										<Link
											to="/customers/$customerId/contacts/$contactId/edit"
											params={{
												customerId,
												contactId: contact.id,
											}}
										>
											Edit
										</Link>
										{hasPermission('customers', 'update-any') && (
											<>
												<span className="list-item-separator">|</span>
												<button
													type="button"
													onClick={() => handleSetPrimary(contact)}
													disabled={isUpdating === contact.id}
													style={{
														background: 'none',
														border: 'none',
														color: '#3b82f6',
														cursor: 'pointer',
														padding: 0,
														font: 'inherit',
													}}
												>
													Set Primary
												</button>
											</>
										)}
										{hasPermission('customers', 'update-any') && (
											<>
												<span className="list-item-separator">|</span>
												<button
													type="button"
													onClick={() => handleDelete(contact.id)}
													disabled={isUpdating === contact.id}
													style={{
														background: 'none',
														border: 'none',
														color: '#ef4444',
														cursor: 'pointer',
														padding: 0,
														font: 'inherit',
													}}
												>
													Delete
												</button>
											</>
										)}
									</div>
								</div>
							))}
						</>
					)}

					{/* Load More button */}
					{hasMoreToLoad && (
						<div className="list-item">
							<div className="list-item-content">
								<div
									className="list-item-info"
									style={{ textAlign: 'center', width: '100%' }}
								>
									<button
										type="button"
										onClick={handleLoadMore}
										className="button-blue"
										style={{ margin: '0 auto' }}
									>
										Load More ({displayedCount} of {nonPrimaryContacts.length}{' '}
										shown)
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
