import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import type { CustomerContact } from '@/shared/customer'
import { Link, useNavigate } from '@tanstack/react-router'
import { Edit2, Phone, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface CustomerDetailProps {
	customerId: string
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	
	// Contact management state
	const [showAddContact, setShowAddContact] = useState(false)
	const [editingContact, setEditingContact] = useState<CustomerContact | null>(null)
	const [newContact, setNewContact] = useState({ phone_number: '', phone_label: '' })
	const [isUpdating, setIsUpdating] = useState<string | null>(null)

	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	// Contact mutations
	const createContactMutation = trpc.customers.addContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			setShowAddContact(false)
			setNewContact({ phone_number: '', phone_label: '' })
		},
	})

	const updateContactMutation = trpc.customers.updateContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			setEditingContact(null)
		},
	})

	const deleteContactMutation = trpc.customers.removeContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
		},
	})

	// Contact handlers
	const handleAddContact = () => {
		if (!newContact.phone_number) return
		createContactMutation.mutate({
			customer_id: customerId,
			phone_number: newContact.phone_number,
			phone_label: newContact.phone_label || null,
			is_primary: 0,
		})
	}

	const handleEditContact = (contact: CustomerContact) => {
		setEditingContact(contact)
	}

	const handleUpdateContact = () => {
		if (!editingContact) return
		updateContactMutation.mutate({
			id: editingContact.id,
			phone_number: editingContact.phone_number,
			phone_label: editingContact.phone_label || null,
		})
	}

	const handleSetPrimary = async (contact: CustomerContact) => {
		if (contact.is_primary === 1) return
		setIsUpdating(contact.id)
		
		try {
			// First, unset current primary
			const currentPrimary = customer?.contacts?.find((c) => c.is_primary === 1)
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

	const handleDeleteContact = (contactId: string) => {
		if (confirm('Are you sure you want to delete this contact?')) {
			deleteContactMutation.mutate(contactId)
		}
	}

	if (error) return <div>Error: {error.message}</div>
	if (!isLoading && !customer) return <div>Customer not found</div>

	return (
		<div>
			<div className="content-header">
				<h1>Customer Details</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/customers">← Back</Link>
					</div>
					<div className="button-group">
						{hasPermission('customers', 'update-any') && customer && (
							<>
								<button
									className="button-gray"
									type="button"
									onClick={() =>
										navigate({
											to: '/customers/$customerId/edit',
											params: { customerId: customer.id },
										})
									}
								>
									Edit Customer
								</button>
								<button
									className="button-secondary"
									type="button"
									onClick={() =>
										navigate({
											to: '/customers/$customerId/addresses',
											params: { customerId: customer.id },
										})
									}
								>
									Manage Addresses
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isLoading} />
					{customer && (
						<div className="detail-content">
							{/* Basic Information */}
							<div className="info-section">
								<h2>Basic Information</h2>
								<div className="info-grid">
									<div>
										<p>
											<strong>Customer ID:</strong> {customer.id}
										</p>
										<p>
											<strong>Name:</strong> {customer.customer_name}
										</p>
										<p>
											<strong>Primary Contact:</strong> {(() => {
												const primaryContact = customer.contacts?.find(
													(c) => c.is_primary === 1,
												)
												return primaryContact ? (
													<span className="contact-info">
														{primaryContact.phone_number}
														{primaryContact.phone_label && (
															<span className="phone-label">
																{' '}
																({primaryContact.phone_label})
															</span>
														)}
													</span>
												) : (
													<span className="no-data">
														No primary contact set
													</span>
												)
											})()}
										</p>
									</div>
									<div>
										<p>
											<strong>Email:</strong>{' '}
											{customer.customer_email || (
												<span className="no-data">No email provided</span>
											)}
										</p>
										<p>
											<strong>Status:</strong>{' '}
											<span
												className={
													customer.status === 1
														? 'badge-success'
														: 'badge-inactive'
												}
											>
												{customer.status === 1 ? 'Active' : 'Inactive'}
											</span>
										</p>
									</div>
								</div>
							</div>

							{/* Default Billing Address Card */}
							<div className="info-section">
								<h2>Default Billing Address</h2>
								{(() => {
									const defaultBilling = customer.addresses?.find(
										(a) => a.address_type === 'billing' && a.is_default === 1,
									)
									return defaultBilling ? (
										<div className="card">
											{defaultBilling.address_label && (
												<p className="address-label">
													{defaultBilling.address_label}
												</p>
											)}
											<p>{defaultBilling.address_line1}</p>
											{defaultBilling.address_line2 && (
												<p>{defaultBilling.address_line2}</p>
											)}
											{defaultBilling.address_line3 && (
												<p>{defaultBilling.address_line3}</p>
											)}
											{defaultBilling.address_line4 && (
												<p>{defaultBilling.address_line4}</p>
											)}
											<p>
												{[
													defaultBilling.city,
													defaultBilling.state,
													defaultBilling.postcode,
												]
													.filter(Boolean)
													.join(', ')}
											</p>
											{defaultBilling.country && (
												<p>{defaultBilling.country}</p>
											)}
										</div>
									) : (
										<p className="no-data">No default billing address set</p>
									)
								})()}
							</div>

							{/* Default Shipping Address Card */}
							<div className="info-section">
								<h2>Default Shipping Address</h2>
								{(() => {
									const defaultShipping = customer.addresses?.find(
										(a) => a.address_type === 'shipping' && a.is_default === 1,
									)
									return defaultShipping ? (
										<div className="card">
											{defaultShipping.address_label && (
												<p className="address-label">
													{defaultShipping.address_label}
												</p>
											)}
											<p>{defaultShipping.address_line1}</p>
											{defaultShipping.address_line2 && (
												<p>{defaultShipping.address_line2}</p>
											)}
											{defaultShipping.address_line3 && (
												<p>{defaultShipping.address_line3}</p>
											)}
											{defaultShipping.address_line4 && (
												<p>{defaultShipping.address_line4}</p>
											)}
											<p>
												{[
													defaultShipping.city,
													defaultShipping.state,
													defaultShipping.postcode,
												]
													.filter(Boolean)
													.join(', ')}
											</p>
											{defaultShipping.country && (
												<p>{defaultShipping.country}</p>
											)}
										</div>
									) : (
										<p className="no-data">No default shipping address set</p>
									)
								})()}
							</div>

							{/* Contacts Management */}
							<div className="info-section">
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
									<h2>Contacts</h2>
									{hasPermission('customers', 'update-any') && (
										<button
											className="button-primary"
											type="button"
											onClick={() => setShowAddContact(true)}
											style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
										>
											<Plus size={16} style={{ marginRight: '0.25rem' }} />
											Add Contact
										</button>
									)}
								</div>

								{customer.contacts && customer.contacts.length > 0 ? (
									<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
										{customer.contacts.map((contact) => (
											<div key={contact.id} className="card" style={{ padding: '1rem' }}>
												{editingContact?.id === contact.id ? (
													// Edit mode
													<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
														<Phone size={16} style={{ color: '#6b7280' }} />
														<input
															type="text"
															value={editingContact.phone_number}
															onChange={(e) =>
																setEditingContact({
																	...editingContact,
																	phone_number: e.target.value,
																})
															}
															placeholder="Phone number"
															style={{ flex: 1, minWidth: '150px' }}
														/>
														<input
															type="text"
															value={editingContact.phone_label || ''}
															onChange={(e) =>
																setEditingContact({
																	...editingContact,
																	phone_label: e.target.value,
																})
															}
															placeholder="Label (optional)"
															style={{ flex: 1, minWidth: '120px' }}
														/>
														<button
															className="button-success"
															type="button"
															onClick={handleUpdateContact}
															style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
														>
															Save
														</button>
														<button
															className="button-gray"
															type="button"
															onClick={() => setEditingContact(null)}
															style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
														>
															<X size={14} />
														</button>
													</div>
												) : (
													// Display mode
													<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
														<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
															<Phone size={16} style={{ color: '#6b7280' }} />
															<div>
																<p style={{ margin: 0, fontWeight: '500' }}>
																	{contact.phone_number}
																	{contact.is_primary === 1 && (
																		<span 
																			className="badge-success" 
																			style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}
																		>
																			Primary
																		</span>
																	)}
																</p>
																{contact.phone_label && (
																	<p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
																		{contact.phone_label}
																	</p>
																)}
															</div>
														</div>
														{hasPermission('customers', 'update-any') && (
															<div style={{ display: 'flex', gap: '0.5rem' }}>
																{contact.is_primary !== 1 && (
																	<button
																		className="button-secondary"
																		type="button"
																		onClick={() => handleSetPrimary(contact)}
																		disabled={isUpdating === contact.id}
																		style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
																	>
																		Set Primary
																	</button>
																)}
																<button
																	className="button-gray"
																	type="button"
																	onClick={() => handleEditContact(contact)}
																	style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
																>
																	<Edit2 size={14} />
																</button>
																<button
																	className="button-danger"
																	type="button"
																	onClick={() => handleDeleteContact(contact.id)}
																	style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
																>
																	<Trash2 size={14} />
																</button>
															</div>
														)}
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="no-data">No contacts found</p>
								)}

								{/* Add new contact form */}
								{showAddContact && (
									<div className="card" style={{ padding: '1rem', marginTop: '1rem', backgroundColor: '#f9fafb' }}>
										<h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Add New Contact</h3>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
											<Phone size={16} style={{ color: '#6b7280' }} />
											<input
												type="text"
												value={newContact.phone_number}
												onChange={(e) =>
													setNewContact({ ...newContact, phone_number: e.target.value })
												}
												placeholder="Phone number *"
												style={{ flex: 1, minWidth: '150px' }}
											/>
											<input
												type="text"
												value={newContact.phone_label}
												onChange={(e) =>
													setNewContact({ ...newContact, phone_label: e.target.value })
												}
												placeholder="Label (optional)"
												style={{ flex: 1, minWidth: '120px' }}
											/>
											<button
												className="button-success"
												type="button"
												onClick={handleAddContact}
												disabled={!newContact.phone_number}
												style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
											>
												Add
											</button>
											<button
												className="button-gray"
												type="button"
												onClick={() => {
													setShowAddContact(false)
													setNewContact({ phone_number: '', phone_label: '' })
												}}
												style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
											>
												<X size={14} />
											</button>
										</div>
									</div>
								)}
							</div>

							{/* Metadata */}
							<div className="info-section light-text">
								<p>
									<strong>Created:</strong>{' '}
									{formatDateTime(customer.created_at)}
								</p>
								<p>
									<strong>Created by:</strong> {customer.created_by}
								</p>
								<p>
									<strong>Updated:</strong>{' '}
									{formatDateTime(customer.updated_at)}
								</p>
								<p>
									<strong>Updated by:</strong> {customer.updated_by}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
