import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface AddressFormProps {
	customerId: string
	addressId?: string
}

interface FormData {
	address_type: 'billing' | 'shipping'
	address_label: string
	address_line1: string
	address_line2: string
	address_line3: string
	address_line4: string
	city: string
	state: string
	postcode: string
	country: string
	is_default: 0 | 1
}

export function AddressForm({
	customerId,
	addressId,
}: AddressFormProps) {
	const isEditMode = !!addressId
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	// Get customer data
	const { data: customer } = trpc.customers.getById.useQuery(customerId)

	// Get existing address if editing
	const existingAddress = addressId
		? customer?.addresses?.find((a) => a.id === addressId)
		: undefined

	const [formData, setFormData] = useState<FormData>({
		address_type: 'billing',
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		city: '',
		state: '',
		postcode: '',
		country: '',
		is_default: 0,
	})

	const [error, setError] = useState<string | null>(null)

	// Load existing address data
	useEffect(() => {
		if (existingAddress) {
			setFormData({
				address_type: existingAddress.address_type,
				address_label: existingAddress.address_label || '',
				address_line1: existingAddress.address_line1 || '',
				address_line2: existingAddress.address_line2 || '',
				address_line3: existingAddress.address_line3 || '',
				address_line4: existingAddress.address_line4 || '',
				city: existingAddress.city || '',
				state: existingAddress.state || '',
				postcode: existingAddress.postcode || '',
				country: existingAddress.country || '',
				is_default: existingAddress.is_default,
			})
		}
	}, [existingAddress])

	// Mutations
	const addMutation = trpc.customers.addAddress.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			navigate({
				to: '/customers/$customerId/addresses',
				params: { customerId },
			})
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const updateMutation = trpc.customers.updateAddress.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			navigate({
				to: '/customers/$customerId/addresses',
				params: { customerId },
			})
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Validate required fields
		if (!formData.address_line1.trim()) {
			setError('Address Line 1 is required')
			return
		}

		if (isEditMode) {
			// Update existing address
			const { address_type, ...updateData } = formData
			updateMutation.mutate({
				id: addressId!,
				...updateData,
			})
		} else {
			// Handle setting as default for new addresses
			if (formData.is_default === 1 && customer) {
				// Find current default for this type
				const currentDefault = customer.addresses?.find(
					(a) => a.address_type === formData.address_type && a.is_default === 1,
				)

				if (currentDefault) {
					// First unset the current default
					await updateMutation.mutateAsync({
						id: currentDefault.id,
						is_default: 0,
					})
				}
			}

			// Add new address
			addMutation.mutate({
				customer_id: customerId,
				...formData,
			})
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
						? 1
						: 0
					: value,
		}))
	}

	const isLoading = addMutation.isPending || updateMutation.isPending

	return (
		<div>
			<div className="content-header">
				<h1>{isEditMode ? 'Edit Address' : 'Add New Address'}</h1>
			</div>

			<div className="content-body">
				<form onSubmit={handleSubmit}>
					{error && <div className="error-message">{error}</div>}

					<fieldset>
						<legend>Address Information</legend>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="address_type">
									Address Type <span className="required">*</span>
								</label>
								<select
									id="address_type"
									name="address_type"
									value={formData.address_type}
									onChange={handleChange}
									disabled={isEditMode}
								>
									<option value="billing">Billing</option>
									<option value="shipping">Shipping</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="address_label">Address Label</label>
								<input
									id="address_label"
									name="address_label"
									type="text"
									value={formData.address_label}
									onChange={handleChange}
									placeholder="Main Office, Warehouse, etc."
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="address_line1">
									Address Line 1 <span className="required">*</span>
								</label>
								<input
									id="address_line1"
									name="address_line1"
									type="text"
									value={formData.address_line1}
									onChange={handleChange}
									required
									placeholder="123 Main Street"
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="address_line2">Address Line 2</label>
								<input
									id="address_line2"
									name="address_line2"
									type="text"
									value={formData.address_line2}
									onChange={handleChange}
									placeholder="Suite 100"
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="address_line3">Address Line 3</label>
								<input
									id="address_line3"
									name="address_line3"
									type="text"
									value={formData.address_line3}
									onChange={handleChange}
								/>
							</div>

							<div className="form-group full-width">
								<label htmlFor="address_line4">Address Line 4</label>
								<input
									id="address_line4"
									name="address_line4"
									type="text"
									value={formData.address_line4}
									onChange={handleChange}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="city">City</label>
								<input
									id="city"
									name="city"
									type="text"
									value={formData.city}
									onChange={handleChange}
									placeholder="New York"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="state">State/Province</label>
								<input
									id="state"
									name="state"
									type="text"
									value={formData.state}
									onChange={handleChange}
									placeholder="NY"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="postcode">Postal Code</label>
								<input
									id="postcode"
									name="postcode"
									type="text"
									value={formData.postcode}
									onChange={handleChange}
									placeholder="10001"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="country">Country</label>
								<input
									id="country"
									name="country"
									type="text"
									value={formData.country}
									onChange={handleChange}
									placeholder="United States"
								/>
							</div>

							<div className="form-group full-width">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="is_default"
										checked={formData.is_default === 1}
										onChange={handleChange}
									/>
									Set as default {formData.address_type} address
								</label>
							</div>
						</div>
					</fieldset>

					<div className="form-actions">
						<button
							type="button"
							onClick={() =>
								navigate({
									to: '/customers/$customerId/addresses',
									params: { customerId },
								})
							}
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
									? 'Update Address'
									: 'Add Address'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
