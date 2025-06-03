import { trpc } from '@/app/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface ContactFormProps {
	customerId: string
	contactId?: string
}

interface FormData {
	phone_number: string
	phone_label: string
	is_primary: 0 | 1
}

export function ContactForm({
	customerId,
	contactId,
}: ContactFormProps) {
	const isEditMode = !!contactId
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	// Get customer data
	const { data: customer } = trpc.customers.getById.useQuery(customerId)

	// Get existing contact if editing
	const existingContact = contactId
		? customer?.contacts?.find((c) => c.id === contactId)
		: undefined

	const [formData, setFormData] = useState<FormData>({
		phone_number: '',
		phone_label: '',
		is_primary: 0,
	})

	const [error, setError] = useState<string | null>(null)

	// Load existing contact data
	useEffect(() => {
		if (existingContact) {
			setFormData({
				phone_number: existingContact.phone_number,
				phone_label: existingContact.phone_label || '',
				is_primary: existingContact.is_primary,
			})
		}
	}, [existingContact])

	// Mutations
	const addMutation = trpc.customers.addContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			navigate({
				to: '/customers/$customerId/contacts',
				params: { customerId },
			})
		},
		onError: (error) => {
			setError(error.message)
		},
	})

	const updateMutation = trpc.customers.updateContact.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
			navigate({
				to: '/customers/$customerId/contacts',
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
		if (!formData.phone_number.trim()) {
			setError('Phone number is required')
			return
		}

		if (isEditMode) {
			// Update existing contact
			updateMutation.mutate({
				id: contactId!,
				...formData,
			})
		} else {
			// Handle setting as primary for new contacts
			if (formData.is_primary === 1 && customer) {
				// Find current primary
				const currentPrimary = customer.contacts?.find(
					(c) => c.is_primary === 1,
				)

				if (currentPrimary) {
					// First unset the current primary
					await updateMutation.mutateAsync({
						id: currentPrimary.id,
						is_primary: 0,
					})
				}
			}

			// Add new contact
			addMutation.mutate({
				customer_id: customerId,
				...formData,
			})
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
				<h1>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</h1>
			</div>

			<div className="content-body">
				<form onSubmit={handleSubmit}>
					{error && <div className="error-message">{error}</div>}

					<fieldset>
						<legend>Contact Information</legend>
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
									placeholder="Mobile, Office, Home, etc."
								/>
							</div>

							<div className="form-group">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="is_primary"
										checked={formData.is_primary === 1}
										onChange={handleChange}
									/>
									Set as primary contact
								</label>
							</div>
						</div>
					</fieldset>

					<div className="form-actions">
						<button
							type="button"
							onClick={() =>
								navigate({
									to: '/customers/$customerId/contacts',
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
									? 'Update Contact'
									: 'Add Contact'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
