import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface CustomerFormProps {
	customerId?: string
}

interface FormData {
	contact_company_name: string
	contact_phone: string
	contact_name: string
	contact_email: string
	status: 1 | 0
	// Billing address fields
	billing_address_label: string
	billing_address_line1: string
	billing_address_line2: string
	billing_address_line3: string
	billing_address_line4: string
	billing_city: string
	billing_state: string
	billing_postcode: string
	billing_country: string
	// Shipping address toggle
	sameAsShipping: boolean
	// Shipping address fields
	shipping_address_label: string
	shipping_address_line1: string
	shipping_address_line2: string
	shipping_address_line3: string
	shipping_address_line4: string
	shipping_city: string
	shipping_state: string
	shipping_postcode: string
	shipping_country: string
}

export function CustomerForm({ customerId }: CustomerFormProps) {
	const isEditMode = !!customerId
	const navigate = useNavigate()

	const [formData, setFormData] = useState<FormData>({
		contact_company_name: '',
		contact_email: '',
		status: 1,
		// Contact
		contact_phone: '',
		contact_name: '',
		// Billing
		billing_address_label: 'Main Office',
		billing_address_line1: '',
		billing_address_line2: '',
		billing_address_line3: '',
		billing_address_line4: '',
		billing_city: '',
		billing_state: '',
		billing_postcode: '',
		billing_country: '',
		// Shipping toggle
		sameAsShipping: true,
		// Shipping
		shipping_address_label: 'Shipping Address',
		shipping_address_line1: '',
		shipping_address_line2: '',
		shipping_address_line3: '',
		shipping_address_line4: '',
		shipping_city: '',
		shipping_state: '',
		shipping_postcode: '',
		shipping_country: '',
	})

	const [error, setError] = useState<string | null>(null)

	// Load customer data in edit mode
	const { data: customer } = trpc.customers.getById.useQuery(customerId!, {
		enabled: isEditMode,
	})

	useEffect(() => {
		if (customer) {
			// Load customer basic info
			setFormData((prev) => ({
				...prev,
				contact_company_name: customer.contact_company_name,
				status: customer.status,
			}))

			// Load primary contact info for editing
			const primaryContact = customer.contacts?.find((c) => c.is_primary === 1)
			if (primaryContact) {
				setFormData((prev) => ({
					...prev,
					contact_email: primaryContact.contact_email || '',
					contact_phone: primaryContact.contact_phone || '',
					contact_name: primaryContact.contact_name || '',
				}))
			}

			// Load default billing address if exists
			const billingAddress = customer.addresses?.find(
				(a) => a.address_type === 'billing' && a.is_default === 1,
			)
			if (billingAddress) {
				setFormData((prev) => ({
					...prev,
					billing_address_label: billingAddress.address_label || 'Main Office',
					billing_address_line1: billingAddress.address_line1 || '',
					billing_address_line2: billingAddress.address_line2 || '',
					billing_address_line3: billingAddress.address_line3 || '',
					billing_address_line4: billingAddress.address_line4 || '',
					billing_city: billingAddress.city || '',
					billing_state: billingAddress.state || '',
					billing_postcode: billingAddress.postcode || '',
					billing_country: billingAddress.country || '',
				}))
			}

			// Load default shipping address if exists
			const shippingAddress = customer.addresses?.find(
				(a) => a.address_type === 'shipping' && a.is_default === 1,
			)
			if (shippingAddress) {
				setFormData((prev) => ({
					...prev,
					sameAsShipping: false,
					shipping_address_label:
						shippingAddress.address_label || 'Shipping Address',
					shipping_address_line1: shippingAddress.address_line1 || '',
					shipping_address_line2: shippingAddress.address_line2 || '',
					shipping_address_line3: shippingAddress.address_line3 || '',
					shipping_address_line4: shippingAddress.address_line4 || '',
					shipping_city: shippingAddress.city || '',
					shipping_state: shippingAddress.state || '',
					shipping_postcode: shippingAddress.postcode || '',
					shipping_country: shippingAddress.country || '',
				}))
			}
		}
	}, [customer])

	// Mutations
	const createMutation = trpc.customers.createWithDetails.useMutation({
		onSuccess: () => {
			navigate({ to: '/customers' })
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const updateMutation = trpc.customers.update.useMutation({
		onSuccess: () => {
			navigate({ to: '/customers' })
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (isEditMode) {
			// In edit mode, only update customer basic info (contact info managed separately)
			updateMutation.mutate({
				id: customerId,
				contact_company_name: formData.contact_company_name,
				status: formData.status,
			})
		} else {
			// In create mode, create customer with all details
			const payload = {
				contact_company_name: formData.contact_company_name,
				contact_email: formData.contact_email || null,
				contact_phone: formData.contact_phone,
				contact_name: formData.contact_name,
				status: 1 as const, // Always active for new customers
				billing_address: formData.billing_address_line1
					? {
							address_type: 'billing' as const,
							address_label: formData.billing_address_label,
							address_line1: formData.billing_address_line1,
							address_line2: formData.billing_address_line2 || null,
							address_line3: formData.billing_address_line3 || null,
							address_line4: formData.billing_address_line4 || null,
							city: formData.billing_city || null,
							state: formData.billing_state || null,
							postcode: formData.billing_postcode || null,
							country: formData.billing_country || null,
							is_default: 1,
						}
					: undefined,
				shipping_address:
					!formData.sameAsShipping && formData.shipping_address_line1
						? {
								address_type: 'shipping' as const,
								address_label: formData.shipping_address_label,
								address_line1: formData.shipping_address_line1,
								address_line2: formData.shipping_address_line2 || null,
								address_line3: formData.shipping_address_line3 || null,
								address_line4: formData.shipping_address_line4 || null,
								city: formData.shipping_city || null,
								state: formData.shipping_state || null,
								postcode: formData.shipping_postcode || null,
								country: formData.shipping_country || null,
								is_default: 1,
							}
						: undefined,
			}

			createMutation.mutate(payload)
		}
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target
		setFormData((prev) => ({
			...prev,
			[name]:
				type === 'checkbox'
					? (e.target as HTMLInputElement).checked
					: name === 'status'
						? (Number(value) as 0 | 1)
						: value,
		}))
	}

	const isLoading = createMutation.isPending || updateMutation.isPending

	return (
		<>
			<div className="content-header">
				<h1>{isEditMode ? 'Edit Customer' : 'Create Customer'}</h1>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isEditMode && !customer} />
					<div className="form-container">
						<form onSubmit={handleSubmit}>
							{error && <div className="error-message">{error}</div>}

							<div className="form-row">
								<label htmlFor="contact_company_name">Company Name *</label>
								<input
									id="contact_company_name"
									name="contact_company_name"
									type="text"
									value={formData.contact_company_name}
									onChange={handleChange}
									required
								/>
							</div>

							{!isEditMode && (
								<>
									<div className="form-row">
										<label htmlFor="contact_phone">Primary Phone *</label>
										<input
											id="contact_phone"
											name="contact_phone"
											type="tel"
											value={formData.contact_phone}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-row">
										<label htmlFor="contact_name">Primary Contact Name *</label>
										<input
											id="contact_name"
											name="contact_name"
											type="text"
											value={formData.contact_name}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-row">
										<label htmlFor="contact_email">Primary Email</label>
										<input
											id="contact_email"
											name="contact_email"
											type="email"
											value={formData.contact_email}
											onChange={handleChange}
										/>
									</div>
								</>
							)}

							{isEditMode && (
								<div className="form-row">
									<label htmlFor="status">Status</label>
									<select
										className="custom-select"
										id="status"
										name="status"
										value={formData.status}
										onChange={handleChange}
									>
										<option value={1}>Active</option>
										<option value={0}>Inactive</option>
									</select>
								</div>
							)}

							{!isEditMode && (
								<>
									{/* Billing Address Section */}
									<h3>Billing Address</h3>

									<div className="form-row">
										<label htmlFor="billing_address_label">Address Label</label>
										<input
											id="billing_address_label"
											name="billing_address_label"
											type="text"
											value={formData.billing_address_label}
											onChange={handleChange}
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_address_line1">
											Address Line 1 *
										</label>
										<input
											id="billing_address_line1"
											name="billing_address_line1"
											type="text"
											value={formData.billing_address_line1}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_address_line2">
											Address Line 2
										</label>
										<input
											id="billing_address_line2"
											name="billing_address_line2"
											type="text"
											value={formData.billing_address_line2}
											onChange={handleChange}
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_city">City</label>
										<input
											id="billing_city"
											name="billing_city"
											type="text"
											value={formData.billing_city}
											onChange={handleChange}
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_state">State/Province</label>
										<input
											id="billing_state"
											name="billing_state"
											type="text"
											value={formData.billing_state}
											onChange={handleChange}
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_postcode">Postal Code</label>
										<input
											id="billing_postcode"
											name="billing_postcode"
											type="text"
											value={formData.billing_postcode}
											onChange={handleChange}
										/>
									</div>

									<div className="form-row">
										<label htmlFor="billing_country">Country</label>
										<input
											id="billing_country"
											name="billing_country"
											type="text"
											value={formData.billing_country}
											onChange={handleChange}
										/>
									</div>

									{/* Shipping Address Toggle */}
									<div className="form-row">
										<label className="checkbox-label">
											<input
												type="checkbox"
												name="sameAsShipping"
												checked={formData.sameAsShipping}
												onChange={handleChange}
											/>
											Shipping address same as billing address
										</label>
									</div>

									{/* Shipping Address */}
									{!formData.sameAsShipping && (
										<>
											<h3>Shipping Address</h3>

											<div className="form-row">
												<label htmlFor="shipping_address_label">
													Address Label
												</label>
												<input
													id="shipping_address_label"
													name="shipping_address_label"
													type="text"
													value={formData.shipping_address_label}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_address_line1">
													Address Line 1
												</label>
												<input
													id="shipping_address_line1"
													name="shipping_address_line1"
													type="text"
													value={formData.shipping_address_line1}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_address_line2">
													Address Line 2
												</label>
												<input
													id="shipping_address_line2"
													name="shipping_address_line2"
													type="text"
													value={formData.shipping_address_line2}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_city">City</label>
												<input
													id="shipping_city"
													name="shipping_city"
													type="text"
													value={formData.shipping_city}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_state">State/Province</label>
												<input
													id="shipping_state"
													name="shipping_state"
													type="text"
													value={formData.shipping_state}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_postcode">Postal Code</label>
												<input
													id="shipping_postcode"
													name="shipping_postcode"
													type="text"
													value={formData.shipping_postcode}
													onChange={handleChange}
												/>
											</div>

											<div className="form-row">
												<label htmlFor="shipping_country">Country</label>
												<input
													id="shipping_country"
													name="shipping_country"
													type="text"
													value={formData.shipping_country}
													onChange={handleChange}
												/>
											</div>
										</>
									)}
								</>
							)}

							<div className="form-actions">
								<button
									className="button-blue"
									type="submit"
									disabled={isLoading}
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
		</>
	)
}
