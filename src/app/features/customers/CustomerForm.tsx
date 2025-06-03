import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { CustomerAddressManager } from './CustomerAddressManager'

interface CustomerFormProps {
	customerId?: string
}

interface PhoneContact {
	id?: string
	phone_number: string
	phone_label: string | null
	is_primary: 0 | 1
}

export function CustomerForm({ customerId }: CustomerFormProps) {
	const isEditMode = !!customerId
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	const [formData, setFormData] = useState({
		customer_name: '',
		customer_email: '',
		status: 1 as 0 | 1,
	})
	const [contacts, setContacts] = useState<PhoneContact[]>([])
	const [newContact, setNewContact] = useState<PhoneContact>({
		phone_number: '',
		phone_label: null,
		is_primary: 0,
	})

	// Address state for new customer creation
	const [billingAddress, setBillingAddress] = useState({
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		postcode: '',
		city: '',
		state: '',
		country: '',
	})
	const [sameAsShipping, setSameAsShipping] = useState(true)
	const [shippingAddress, setShippingAddress] = useState({
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		postcode: '',
		city: '',
		state: '',
		country: '',
	})

	// Fetch existing customer if in edit mode
	const {
		data: customer,
		isLoading,
		refetch,
	} = trpc.customers.getById.useQuery(customerId!, {
		enabled: isEditMode,
	})

	// Populate form when customer loads
	useEffect(() => {
		if (customer && isEditMode) {
			setFormData({
				customer_name: customer.customer_name,
				customer_email: customer.customer_email || '',
				status: customer.status,
			})
			setContacts(customer.contacts || [])
		}
	}, [customer, isEditMode])

	const createMutation = trpc.customers.create.useMutation({
		onSuccess: async (newCustomer) => {
			try {
				// Add phone contacts if any
				for (const contact of contacts) {
					await addContactMutation.mutateAsync({
						customer_id: newCustomer.id,
						phone_number: contact.phone_number,
						phone_label: contact.phone_label || null,
						is_primary: contact.is_primary,
					})
				}

				// Add billing address (required)
				if (billingAddress.address_line1) {
					await addAddressMutation.mutateAsync({
						customer_id: newCustomer.id,
						address_type: 'billing' as const,
						address_label: billingAddress.address_label || null,
						address_line1: billingAddress.address_line1,
						address_line2: billingAddress.address_line2 || null,
						address_line3: billingAddress.address_line3 || null,
						address_line4: billingAddress.address_line4 || null,
						postcode: billingAddress.postcode || null,
						city: billingAddress.city || null,
						state: billingAddress.state || null,
						country: billingAddress.country || null,
						is_default: 1,
					})
				}

				// Add shipping address if different from billing
				if (!sameAsShipping && shippingAddress.address_line1) {
					await addAddressMutation.mutateAsync({
						customer_id: newCustomer.id,
						address_type: 'shipping' as const,
						address_label: shippingAddress.address_label || null,
						address_line1: shippingAddress.address_line1,
						address_line2: shippingAddress.address_line2 || null,
						address_line3: shippingAddress.address_line3 || null,
						address_line4: shippingAddress.address_line4 || null,
						postcode: shippingAddress.postcode || null,
						city: shippingAddress.city || null,
						state: shippingAddress.state || null,
						country: shippingAddress.country || null,
						is_default: 1,
					})
				} else if (sameAsShipping && billingAddress.address_line1) {
					// Create shipping address same as billing
					await addAddressMutation.mutateAsync({
						customer_id: newCustomer.id,
						address_type: 'shipping' as const,
						address_label: billingAddress.address_label || null,
						address_line1: billingAddress.address_line1,
						address_line2: billingAddress.address_line2 || null,
						address_line3: billingAddress.address_line3 || null,
						address_line4: billingAddress.address_line4 || null,
						postcode: billingAddress.postcode || null,
						city: billingAddress.city || null,
						state: billingAddress.state || null,
						country: billingAddress.country || null,
						is_default: 1,
					})
				}

				// Invalidate customers list to show the new customer
				await utils.customers.listAll.invalidate()
				navigate({ to: '/customers' })
			} catch (error) {
				console.error('Error creating customer with addresses:', error)
				alert('Customer created but there was an error adding some details')
			}
		},
		onError: (error) => {
			alert(`Error: ${error.message}`)
		},
	})

	const updateMutation = trpc.customers.update.useMutation({
		onSuccess: async () => {
			// Invalidate customers list to show the updated customer at top
			await utils.customers.listAll.invalidate()
			navigate({ to: '/customers' })
		},
		onError: (error) => {
			alert(`Error: ${error.message}`)
		},
	})

	const addContactMutation = trpc.customers.addContact.useMutation()
	const updateContactMutation = trpc.customers.updateContact.useMutation()
	const removeContactMutation = trpc.customers.removeContact.useMutation()
	const addAddressMutation = trpc.customers.addAddress.useMutation()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Validate billing address for new customers
		if (!isEditMode && !billingAddress.address_line1) {
			alert('Billing address is required for new customers')
			return
		}

		// Validate shipping address if not same as billing
		if (!isEditMode && !sameAsShipping && !shippingAddress.address_line1) {
			alert('Shipping address is required when not same as billing')
			return
		}

		if (isEditMode) {
			updateMutation.mutate({
				id: customerId,
				customer_name: formData.customer_name,
				customer_email: formData.customer_email || null,
				status: formData.status,
			})
		} else {
			createMutation.mutate({
				customer_name: formData.customer_name,
				customer_email: formData.customer_email || null,
				status: formData.status,
			})
		}
	}

	const handleAddContact = () => {
		if (!newContact.phone_number) return

		if (isEditMode && customerId) {
			// Add contact directly to database
			addContactMutation.mutate(
				{
					customer_id: customerId,
					phone_number: newContact.phone_number,
					phone_label: newContact.phone_label || null,
					is_primary: newContact.is_primary,
				},
				{
					onSuccess: (contact) => {
						setContacts([...contacts, contact])
						setNewContact({
							phone_number: '',
							phone_label: null,
							is_primary: 0,
						})
					},
				},
			)
		} else {
			// Add to local state for new customer
			setContacts([...contacts, newContact])
			setNewContact({ phone_number: '', phone_label: null, is_primary: 0 })
		}
	}

	const handleRemoveContact = (index: number) => {
		const contact = contacts[index]
		if (isEditMode && contact.id) {
			removeContactMutation.mutate(contact.id, {
				onSuccess: () => {
					setContacts(contacts.filter((_, i) => i !== index))
				},
			})
		} else {
			setContacts(contacts.filter((_, i) => i !== index))
		}
	}

	const handleSetPrimary = (index: number) => {
		const contact = contacts[index]
		if (isEditMode && contact.id) {
			updateContactMutation.mutate(
				{
					id: contact.id,
					is_primary: 1,
				},
				{
					onSuccess: () => {
						setContacts(
							contacts.map(
								(c, i) =>
									({
										...c,
										is_primary: i === index ? 1 : 0,
									}) as PhoneContact,
							),
						)
					},
				},
			)
		} else {
			setContacts(
				contacts.map(
					(c, i) =>
						({
							...c,
							is_primary: i === index ? 1 : 0,
						}) as PhoneContact,
				),
			)
		}
	}

	if (isEditMode && isLoading)
		return <div style={{ padding: '1rem' }}>Loading...</div>

	const isPending = createMutation.isPending || updateMutation.isPending

	return (
		<div style={{ padding: '1rem', maxWidth: '600px' }}>
			<h1>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h1>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="customer_name"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Customer Name *
					</label>
					<input
						type="text"
						id="customer_name"
						value={formData.customer_name}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								customer_name: e.target.value,
							}))
						}
						required
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					/>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="customer_email"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Email
					</label>
					<input
						type="email"
						id="customer_email"
						value={formData.customer_email}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								customer_email: e.target.value,
							}))
						}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					/>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="status"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Status
					</label>
					<select
						id="status"
						value={formData.status}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								status: Number(e.target.value) as 0 | 1,
							}))
						}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					>
						<option value={1}>Active</option>
						<option value={0}>Inactive</option>
					</select>
				</div>

				{/* Phone Contacts Section */}
				<div style={{ marginBottom: '1rem' }}>
					<h3>Phone Contacts</h3>

					{/* Existing contacts */}
					{contacts.length > 0 && (
						<div style={{ marginBottom: '1rem' }}>
							{contacts.map((contact, index) => (
								<div
									key={contact.id || `contact-${index}`}
									style={{
										display: 'flex',
										gap: '0.5rem',
										alignItems: 'center',
										marginBottom: '0.5rem',
									}}
								>
									<input
										type="text"
										value={contact.phone_number}
										readOnly
										style={{
											flex: 1,
											padding: '0.5rem',
											border: '1px solid #ccc',
											borderRadius: '4px',
											backgroundColor: '#f5f5f5',
										}}
									/>
									<span style={{ fontSize: '0.9rem', color: '#666' }}>
										{contact.phone_label || 'No label'}
									</span>
									{contact.is_primary === 1 && (
										<span style={{ color: 'green', fontWeight: 'bold' }}>
											Primary
										</span>
									)}
									{contact.is_primary === 0 && (
										<button
											type="button"
											onClick={() => handleSetPrimary(index)}
											style={{
												padding: '0.25rem 0.5rem',
												backgroundColor: '#28a745',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
											}}
										>
											Set Primary
										</button>
									)}
									<button
										type="button"
										onClick={() => handleRemoveContact(index)}
										style={{
											padding: '0.25rem 0.5rem',
											backgroundColor: '#dc3545',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
										}}
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}

					{/* Add new contact */}
					<div
						style={{
							border: '1px solid #ddd',
							padding: '1rem',
							borderRadius: '4px',
						}}
					>
						<h4>Add Phone Contact</h4>
						<div
							style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
						>
							<input
								type="text"
								placeholder="Phone number"
								value={newContact.phone_number}
								onChange={(e) =>
									setNewContact((prev) => ({
										...prev,
										phone_number: e.target.value,
									}))
								}
								style={{
									flex: 1,
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
							<input
								type="text"
								placeholder="Label (e.g., mobile, office)"
								value={newContact.phone_label || ''}
								onChange={(e) =>
									setNewContact((prev) => ({
										...prev,
										phone_label: e.target.value || null,
									}))
								}
								style={{
									flex: 1,
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>
						<div
							style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
						>
							<label>
								<input
									type="checkbox"
									checked={newContact.is_primary === 1}
									onChange={(e) =>
										setNewContact((prev) => ({
											...prev,
											is_primary: e.target.checked ? 1 : 0,
										}))
									}
								/>{' '}
								Set as primary
							</label>
							<button
								type="button"
								onClick={handleAddContact}
								disabled={!newContact.phone_number}
								style={{
									marginLeft: 'auto',
									padding: '0.5rem 1rem',
									backgroundColor: '#007bff',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: newContact.phone_number ? 'pointer' : 'not-allowed',
								}}
							>
								Add Contact
							</button>
						</div>
					</div>
				</div>

				{/* Address Section for New Customer */}
				{!isEditMode && (
					<div style={{ marginTop: '2rem' }}>
						<h3>Billing Address (Required)</h3>
						<div style={{ marginBottom: '1rem' }}>
							<label
								htmlFor="billing_address_label"
								style={{ display: 'block', marginBottom: '0.5rem' }}
							>
								Address Label (e.g., Main Office)
							</label>
							<input
								id="billing_address_label"
								type="text"
								value={billingAddress.address_label}
								onChange={(e) =>
									setBillingAddress((prev) => ({
										...prev,
										address_label: e.target.value,
									}))
								}
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label
								htmlFor="billing_address_line1"
								style={{ display: 'block', marginBottom: '0.5rem' }}
							>
								Address Line 1 *
							</label>
							<input
								id="billing_address_line1"
								type="text"
								value={billingAddress.address_line1}
								onChange={(e) =>
									setBillingAddress((prev) => ({
										...prev,
										address_line1: e.target.value,
									}))
								}
								required
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label
								htmlFor="billing_address_line2"
								style={{ display: 'block', marginBottom: '0.5rem' }}
							>
								Address Line 2
							</label>
							<input
								id="billing_address_line2"
								type="text"
								value={billingAddress.address_line2}
								onChange={(e) =>
									setBillingAddress((prev) => ({
										...prev,
										address_line2: e.target.value,
									}))
								}
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label
								htmlFor="billing_address_line3"
								style={{ display: 'block', marginBottom: '0.5rem' }}
							>
								Address Line 3
							</label>
							<input
								id="billing_address_line3"
								type="text"
								value={billingAddress.address_line3}
								onChange={(e) =>
									setBillingAddress((prev) => ({
										...prev,
										address_line3: e.target.value,
									}))
								}
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<label
								htmlFor="billing_address_line4"
								style={{ display: 'block', marginBottom: '0.5rem' }}
							>
								Address Line 4
							</label>
							<input
								id="billing_address_line4"
								type="text"
								value={billingAddress.address_line4}
								onChange={(e) =>
									setBillingAddress((prev) => ({
										...prev,
										address_line4: e.target.value,
									}))
								}
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px solid #ccc',
									borderRadius: '4px',
								}}
							/>
						</div>

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '1rem',
								marginBottom: '1rem',
							}}
						>
							<div>
								<label
									htmlFor="billing_city"
									style={{ display: 'block', marginBottom: '0.5rem' }}
								>
									City
								</label>
								<input
									id="billing_city"
									type="text"
									value={billingAddress.city}
									onChange={(e) =>
										setBillingAddress((prev) => ({
											...prev,
											city: e.target.value,
										}))
									}
									style={{
										width: '100%',
										padding: '0.5rem',
										border: '1px solid #ccc',
										borderRadius: '4px',
									}}
								/>
							</div>
							<div>
								<label
									htmlFor="billing_state"
									style={{ display: 'block', marginBottom: '0.5rem' }}
								>
									State
								</label>
								<input
									id="billing_state"
									type="text"
									value={billingAddress.state}
									onChange={(e) =>
										setBillingAddress((prev) => ({
											...prev,
											state: e.target.value,
										}))
									}
									style={{
										width: '100%',
										padding: '0.5rem',
										border: '1px solid #ccc',
										borderRadius: '4px',
									}}
								/>
							</div>
						</div>

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '1rem',
								marginBottom: '1rem',
							}}
						>
							<div>
								<label
									htmlFor="billing_postcode"
									style={{ display: 'block', marginBottom: '0.5rem' }}
								>
									Postcode
								</label>
								<input
									id="billing_postcode"
									type="text"
									value={billingAddress.postcode}
									onChange={(e) =>
										setBillingAddress((prev) => ({
											...prev,
											postcode: e.target.value,
										}))
									}
									style={{
										width: '100%',
										padding: '0.5rem',
										border: '1px solid #ccc',
										borderRadius: '4px',
									}}
								/>
							</div>
							<div>
								<label
									htmlFor="billing_country"
									style={{ display: 'block', marginBottom: '0.5rem' }}
								>
									Country
								</label>
								<input
									id="billing_country"
									type="text"
									value={billingAddress.country}
									onChange={(e) =>
										setBillingAddress((prev) => ({
											...prev,
											country: e.target.value,
										}))
									}
									style={{
										width: '100%',
										padding: '0.5rem',
										border: '1px solid #ccc',
										borderRadius: '4px',
									}}
								/>
							</div>
						</div>

						{/* Shipping Address */}
						<div
							style={{
								marginTop: '2rem',
								padding: '1rem',
								backgroundColor: '#f8f9fa',
								borderRadius: '4px',
							}}
						>
							<label
								style={{
									display: 'flex',
									alignItems: 'center',
									marginBottom: '1rem',
								}}
							>
								<input
									type="checkbox"
									checked={sameAsShipping}
									onChange={(e) => setSameAsShipping(e.target.checked)}
									style={{ marginRight: '0.5rem' }}
								/>
								<strong>Shipping address same as billing</strong>
							</label>

							{!sameAsShipping && (
								<>
									<h3>Shipping Address</h3>
									<div style={{ marginBottom: '1rem' }}>
										<label
											htmlFor="shipping_address_label"
											style={{ display: 'block', marginBottom: '0.5rem' }}
										>
											Address Label (e.g., Warehouse)
										</label>
										<input
											id="shipping_address_label"
											type="text"
											value={shippingAddress.address_label}
											onChange={(e) =>
												setShippingAddress((prev) => ({
													...prev,
													address_label: e.target.value,
												}))
											}
											style={{
												width: '100%',
												padding: '0.5rem',
												border: '1px solid #ccc',
												borderRadius: '4px',
											}}
										/>
									</div>

									<div style={{ marginBottom: '1rem' }}>
										<label
											htmlFor="shipping_address_line1"
											style={{ display: 'block', marginBottom: '0.5rem' }}
										>
											Address Line 1 *
										</label>
										<input
											id="shipping_address_line1"
											type="text"
											value={shippingAddress.address_line1}
											onChange={(e) =>
												setShippingAddress((prev) => ({
													...prev,
													address_line1: e.target.value,
												}))
											}
											required={!sameAsShipping}
											style={{
												width: '100%',
												padding: '0.5rem',
												border: '1px solid #ccc',
												borderRadius: '4px',
											}}
										/>
									</div>

									<div style={{ marginBottom: '1rem' }}>
										<label
											htmlFor="shipping_address_line2"
											style={{ display: 'block', marginBottom: '0.5rem' }}
										>
											Address Line 2
										</label>
										<input
											id="shipping_address_line2"
											type="text"
											value={shippingAddress.address_line2}
											onChange={(e) =>
												setShippingAddress((prev) => ({
													...prev,
													address_line2: e.target.value,
												}))
											}
											style={{
												width: '100%',
												padding: '0.5rem',
												border: '1px solid #ccc',
												borderRadius: '4px',
											}}
										/>
									</div>

									<div style={{ marginBottom: '1rem' }}>
										<label
											htmlFor="shipping_address_line3"
											style={{ display: 'block', marginBottom: '0.5rem' }}
										>
											Address Line 3
										</label>
										<input
											id="shipping_address_line3"
											type="text"
											value={shippingAddress.address_line3}
											onChange={(e) =>
												setShippingAddress((prev) => ({
													...prev,
													address_line3: e.target.value,
												}))
											}
											style={{
												width: '100%',
												padding: '0.5rem',
												border: '1px solid #ccc',
												borderRadius: '4px',
											}}
										/>
									</div>

									<div style={{ marginBottom: '1rem' }}>
										<label
											htmlFor="shipping_address_line4"
											style={{ display: 'block', marginBottom: '0.5rem' }}
										>
											Address Line 4
										</label>
										<input
											id="shipping_address_line4"
											type="text"
											value={shippingAddress.address_line4}
											onChange={(e) =>
												setShippingAddress((prev) => ({
													...prev,
													address_line4: e.target.value,
												}))
											}
											style={{
												width: '100%',
												padding: '0.5rem',
												border: '1px solid #ccc',
												borderRadius: '4px',
											}}
										/>
									</div>

									<div
										style={{
											display: 'grid',
											gridTemplateColumns: '1fr 1fr',
											gap: '1rem',
											marginBottom: '1rem',
										}}
									>
										<div>
											<label
												htmlFor="shipping_city"
												style={{ display: 'block', marginBottom: '0.5rem' }}
											>
												City
											</label>
											<input
												id="shipping_city"
												type="text"
												value={shippingAddress.city}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														city: e.target.value,
													}))
												}
												style={{
													width: '100%',
													padding: '0.5rem',
													border: '1px solid #ccc',
													borderRadius: '4px',
												}}
											/>
										</div>
										<div>
											<label
												htmlFor="shipping_state"
												style={{ display: 'block', marginBottom: '0.5rem' }}
											>
												State
											</label>
											<input
												id="shipping_state"
												type="text"
												value={shippingAddress.state}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														state: e.target.value,
													}))
												}
												style={{
													width: '100%',
													padding: '0.5rem',
													border: '1px solid #ccc',
													borderRadius: '4px',
												}}
											/>
										</div>
									</div>

									<div
										style={{
											display: 'grid',
											gridTemplateColumns: '1fr 1fr',
											gap: '1rem',
											marginBottom: '1rem',
										}}
									>
										<div>
											<label
												htmlFor="shipping_postcode"
												style={{ display: 'block', marginBottom: '0.5rem' }}
											>
												Postcode
											</label>
											<input
												id="shipping_postcode"
												type="text"
												value={shippingAddress.postcode}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														postcode: e.target.value,
													}))
												}
												style={{
													width: '100%',
													padding: '0.5rem',
													border: '1px solid #ccc',
													borderRadius: '4px',
												}}
											/>
										</div>
										<div>
											<label
												htmlFor="shipping_country"
												style={{ display: 'block', marginBottom: '0.5rem' }}
											>
												Country
											</label>
											<input
												id="shipping_country"
												type="text"
												value={shippingAddress.country}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														country: e.target.value,
													}))
												}
												style={{
													width: '100%',
													padding: '0.5rem',
													border: '1px solid #ccc',
													borderRadius: '4px',
												}}
											/>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				)}

				{/* Address Management for Existing Customer */}
				{isEditMode && customerId && (
					<div style={{ marginTop: '2rem' }}>
						<CustomerAddressManager
							customerId={customerId}
							addresses={customer?.addresses || []}
							onAddressesChange={() => refetch()}
						/>
					</div>
				)}

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						type="submit"
						disabled={isPending}
						style={{
							backgroundColor: '#007bff',
							color: 'white',
							padding: '0.75rem 1.5rem',
							border: 'none',
							borderRadius: '4px',
							cursor: isPending ? 'not-allowed' : 'pointer',
						}}
					>
						{isEditMode ? 'Update Customer' : 'Create Customer'}
					</button>

					<button
						type="button"
						onClick={() => navigate({ to: '/customers' })}
						style={{
							backgroundColor: '#6c757d',
							color: 'white',
							padding: '0.75rem 1.5rem',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}
