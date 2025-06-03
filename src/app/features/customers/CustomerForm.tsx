import { AddressForm, type AddressFormData } from './AddressForm'
import { ContactManager, type PhoneContact } from './ContactManager'
import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { CustomerAddressManager } from './CustomerAddressManager'

interface CustomerFormProps {
	customerId?: string
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

	// Address state for new customer creation
	const [billingAddress, setBillingAddress] = useState<AddressFormData>({
		address_type: 'billing',
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		postcode: '',
		city: '',
		state: '',
		country: '',
		is_default: 1,
	})
	const [sameAsShipping, setSameAsShipping] = useState(true)
	const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
		address_type: 'shipping',
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		postcode: '',
		city: '',
		state: '',
		country: '',
		is_default: 1,
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

	const createMutation = trpc.customers.createWithDetails.useMutation({
		onSuccess: async () => {
			// Invalidate customers list to show the new customer
			await utils.customers.listAll.invalidate()
			navigate({ to: '/customers' })
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
				contacts: contacts.length > 0 ? contacts : undefined,
				billing_address: billingAddress.address_line1
					? {
							address_label: billingAddress.address_label || null,
							address_line1: billingAddress.address_line1,
							address_line2: billingAddress.address_line2 || null,
							address_line3: billingAddress.address_line3 || null,
							address_line4: billingAddress.address_line4 || null,
							postcode: billingAddress.postcode || null,
							city: billingAddress.city || null,
							state: billingAddress.state || null,
							country: billingAddress.country || null,
						}
					: undefined,
				shipping_address:
					!sameAsShipping && shippingAddress.address_line1
						? {
								address_label: shippingAddress.address_label || null,
								address_line1: shippingAddress.address_line1,
								address_line2: shippingAddress.address_line2 || null,
								address_line3: shippingAddress.address_line3 || null,
								address_line4: shippingAddress.address_line4 || null,
								postcode: shippingAddress.postcode || null,
								city: shippingAddress.city || null,
								state: shippingAddress.state || null,
								country: shippingAddress.country || null,
							}
						: sameAsShipping && billingAddress.address_line1
							? {
									address_label: billingAddress.address_label || null,
									address_line1: billingAddress.address_line1,
									address_line2: billingAddress.address_line2 || null,
									address_line3: billingAddress.address_line3 || null,
									address_line4: billingAddress.address_line4 || null,
									postcode: billingAddress.postcode || null,
									city: billingAddress.city || null,
									state: billingAddress.state || null,
									country: billingAddress.country || null,
								}
							: undefined,
			})
		}
	}

	const handleAddContact = (newContact: PhoneContact) => {
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
					},
				},
			)
		} else {
			// Add to local state for new customer
			setContacts([...contacts, newContact])
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
		<div>
			<div className="content-header">
				<h1>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h1>
			</div>
			<div className="content-body">
				<div className="scroll-container">
					<div className="form-container">
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
									className="custom-select"
									id="status"
									value={formData.status}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											status: Number(e.target.value) as 0 | 1,
										}))
									}
								>
									<option value={1}>Active</option>
									<option value={0}>Inactive</option>
								</select>
							</div>

							{/* Phone Contacts Section */}
							<ContactManager
								contacts={contacts}
								onAdd={handleAddContact}
								onRemove={handleRemoveContact}
								onSetPrimary={handleSetPrimary}
								isPending={isPending}
							/>

							{/* Address Section for New Customer */}
							{!isEditMode && (
								<div style={{ marginTop: '2rem' }}>
									<h3>Billing Address (Required)</h3>
									<AddressForm
										formData={billingAddress}
										onChange={setBillingAddress}
										showTypeSelector={false}
										addressTypeLabel="Billing Address Label"
									/>

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
												<AddressForm
													formData={shippingAddress}
													onChange={setShippingAddress}
													showTypeSelector={false}
													addressTypeLabel="Shipping Address Label"
												/>
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

							<div className="form-actions">
								<button
									className="button-blue"
									type="submit"
									disabled={isPending}
								>
									{isEditMode ? 'Update Customer' : 'Create Customer'}
								</button>

								<button
									className="button-gray"
									type="button"
									onClick={() => navigate({ to: '/customers' })}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}
