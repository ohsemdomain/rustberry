import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface CustomerFormProps {
	customerId?: string
}

interface FormData {
	customer_name: string
	customer_email: string
	status: 1 | 0
	// Contact fields
	phone_number: string
	phone_label: string
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
		customer_name: '',
		customer_email: '',
		status: 1,
		// Contact
		phone_number: '',
		phone_label: '',
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
				customer_name: customer.customer_name,
				customer_email: customer.customer_email || '',
				status: customer.status,
			}))

			// Load primary contact if exists
			const primaryContact = customer.contacts?.find((c) => c.is_primary === 1)
			if (primaryContact) {
				setFormData((prev) => ({
					...prev,
					phone_number: primaryContact.phone_number,
					phone_label: primaryContact.phone_label || '',
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
			// In edit mode, only update customer basic info
			updateMutation.mutate({
				id: customerId,
				customer_name: formData.customer_name,
				customer_email: formData.customer_email || null,
				status: formData.status,
			})
		} else {
			// In create mode, create customer with all details
			const payload = {
				customer_name: formData.customer_name,
				customer_email: formData.customer_email || null,
				status: 1 as 1, // Always active for new customers
				contacts: formData.phone_number
					? [
							{
								phone_number: formData.phone_number,
								phone_label: formData.phone_label || null,
								is_primary: 1 as const,
							},
						]
					: undefined,
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
					? Number(value) as 0 | 1
					: value,
		}))
	}

	const isLoading = createMutation.isPending || updateMutation.isPending

	return (
		<div>
			<div className="content-header">
				<h1>{isEditMode ? 'Edit Customer' : 'Create Customer'}</h1>
			</div>

			<div className="content-body">
				<form onSubmit={handleSubmit}>
					{error && <div className="error-message">{error}</div>}

					{/* Customer Information */}
					<fieldset>
						<legend>Customer Information</legend>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="customer_name">
									Customer Name <span className="required">*</span>
								</label>
								<input
									id="customer_name"
									name="customer_name"
									type="text"
									value={formData.customer_name}
									onChange={handleChange}
									required
									placeholder="Enter customer name"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="customer_email">Email</label>
								<input
									id="customer_email"
									name="customer_email"
									type="email"
									value={formData.customer_email}
									onChange={handleChange}
									placeholder="customer@example.com"
								/>
							</div>

							{isEditMode && (
								<div className="form-group">
									<label htmlFor="status">Status</label>
									<select
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
						</div>
					</fieldset>

					{!isEditMode && (
						<>
							{/* Contact Information */}
							<fieldset>
								<legend>Primary Contact</legend>
								<div className="form-grid">
									<div className="form-group">
										<label htmlFor="phone_number">
											Phone Number <span className="required">*</span>
										</label>
										<input
											id="phone_number"
											name="phone_number"
											type="tel"
											value={formData.phone_number}
											onChange={handleChange}
											required
											placeholder="+1234567890"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="phone_label">Phone Label</label>
										<input
											id="phone_label"
											name="phone_label"
											type="text"
											value={formData.phone_label}
											onChange={handleChange}
											placeholder="Mobile, Office, etc."
										/>
									</div>
								</div>
							</fieldset>

							{/* Billing Address */}
							<fieldset>
								<legend>Billing Address</legend>
								<div className="form-grid">
									<div className="form-group">
										<label htmlFor="billing_address_label">Address Label</label>
										<input
											id="billing_address_label"
											name="billing_address_label"
											type="text"
											value={formData.billing_address_label}
											onChange={handleChange}
											placeholder="Main Office"
										/>
									</div>

									<div className="form-group full-width">
										<label htmlFor="billing_address_line1">
											Address Line 1 <span className="required">*</span>
										</label>
										<input
											id="billing_address_line1"
											name="billing_address_line1"
											type="text"
											value={formData.billing_address_line1}
											onChange={handleChange}
											required
											placeholder="123 Main Street"
										/>
									</div>

									<div className="form-group full-width">
										<label htmlFor="billing_address_line2">
											Address Line 2
										</label>
										<input
											id="billing_address_line2"
											name="billing_address_line2"
											type="text"
											value={formData.billing_address_line2}
											onChange={handleChange}
											placeholder="Suite 100"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="billing_city">City</label>
										<input
											id="billing_city"
											name="billing_city"
											type="text"
											value={formData.billing_city}
											onChange={handleChange}
											placeholder="New York"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="billing_state">State/Province</label>
										<input
											id="billing_state"
											name="billing_state"
											type="text"
											value={formData.billing_state}
											onChange={handleChange}
											placeholder="NY"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="billing_postcode">Postal Code</label>
										<input
											id="billing_postcode"
											name="billing_postcode"
											type="text"
											value={formData.billing_postcode}
											onChange={handleChange}
											placeholder="10001"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="billing_country">Country</label>
										<input
											id="billing_country"
											name="billing_country"
											type="text"
											value={formData.billing_country}
											onChange={handleChange}
											placeholder="United States"
										/>
									</div>
								</div>
							</fieldset>

							{/* Shipping Address Toggle */}
							<fieldset>
								<div className="form-group">
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
							</fieldset>

							{/* Shipping Address */}
							{!formData.sameAsShipping && (
								<fieldset>
									<legend>Shipping Address</legend>
									<div className="form-grid">
										<div className="form-group">
											<label htmlFor="shipping_address_label">
												Address Label
											</label>
											<input
												id="shipping_address_label"
												name="shipping_address_label"
												type="text"
												value={formData.shipping_address_label}
												onChange={handleChange}
												placeholder="Warehouse"
											/>
										</div>

										<div className="form-group full-width">
											<label htmlFor="shipping_address_line1">
												Address Line 1
											</label>
											<input
												id="shipping_address_line1"
												name="shipping_address_line1"
												type="text"
												value={formData.shipping_address_line1}
												onChange={handleChange}
												placeholder="456 Industrial Ave"
											/>
										</div>

										<div className="form-group full-width">
											<label htmlFor="shipping_address_line2">
												Address Line 2
											</label>
											<input
												id="shipping_address_line2"
												name="shipping_address_line2"
												type="text"
												value={formData.shipping_address_line2}
												onChange={handleChange}
												placeholder="Building B"
											/>
										</div>

										<div className="form-group">
											<label htmlFor="shipping_city">City</label>
											<input
												id="shipping_city"
												name="shipping_city"
												type="text"
												value={formData.shipping_city}
												onChange={handleChange}
												placeholder="Brooklyn"
											/>
										</div>

										<div className="form-group">
											<label htmlFor="shipping_state">State/Province</label>
											<input
												id="shipping_state"
												name="shipping_state"
												type="text"
												value={formData.shipping_state}
												onChange={handleChange}
												placeholder="NY"
											/>
										</div>

										<div className="form-group">
											<label htmlFor="shipping_postcode">Postal Code</label>
											<input
												id="shipping_postcode"
												name="shipping_postcode"
												type="text"
												value={formData.shipping_postcode}
												onChange={handleChange}
												placeholder="11201"
											/>
										</div>

										<div className="form-group">
											<label htmlFor="shipping_country">Country</label>
											<input
												id="shipping_country"
												name="shipping_country"
												type="text"
												value={formData.shipping_country}
												onChange={handleChange}
												placeholder="United States"
											/>
										</div>
									</div>
								</fieldset>
							)}
						</>
					)}

					{/* Form Actions */}
					<div className="form-actions">
						<button
							type="button"
							onClick={() => navigate({ to: '/customers' })}
							className="button-secondary"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="button-primary"
						>
							{isLoading
								? 'Saving...'
								: isEditMode
									? 'Update Customer'
									: 'Create Customer'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
