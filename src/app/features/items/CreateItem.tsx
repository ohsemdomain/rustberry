import { trpc } from '@/trpc'
import { displayToCents, sanitizePriceInput } from '@/utils/price'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function CreateItem() {
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		item_name: '',
		item_category: 1,
		item_price_display: '', // Display value for price input
		item_description: '',
		item_status: 1,
	})

	const createMutation = trpc.items.create.useMutation({
		onSuccess: () => {
			navigate({ to: '/items' })
		},
		onError: (error) => {
			alert(`Error: ${error.message}`)
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Convert display price to cents
		const item_price_cents = displayToCents(formData.item_price_display)

		createMutation.mutate({
			item_name: formData.item_name,
			item_category: formData.item_category as 1 | 2 | 3,
			item_price_cents,
			item_description: formData.item_description || undefined,
			item_status: formData.item_status as 0 | 1,
		})
	}

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sanitized = sanitizePriceInput(e.target.value)
		setFormData((prev) => ({ ...prev, item_price_display: sanitized }))
	}

	return (
		<div style={{ padding: '1rem', maxWidth: '600px' }}>
			<h1>Create New Item</h1>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="item_name"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Item Name *
					</label>
					<input
						type="text"
						id="item_name"
						value={formData.item_name}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, item_name: e.target.value }))
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
						htmlFor="item_category"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Category *
					</label>
					<select
						id="item_category"
						value={formData.item_category}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								item_category: Number(e.target.value),
							}))
						}
						required
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					>
						<option value={1}>Packaging</option>
						<option value={2}>Label</option>
						<option value={3}>Other</option>
					</select>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="item_price"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Price (RM) *
					</label>
					<input
						type="text"
						id="item_price"
						value={formData.item_price_display}
						onChange={handlePriceChange}
						placeholder="25.00"
						required
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					/>
					<small style={{ color: '#666' }}>
						Enter price without currency symbol (e.g., 25.00)
					</small>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="item_description"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Description
					</label>
					<textarea
						id="item_description"
						value={formData.item_description}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								item_description: e.target.value,
							}))
						}
						rows={3}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
							resize: 'vertical',
						}}
					/>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="item_status"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Status
					</label>
					<select
						id="item_status"
						value={formData.item_status}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								item_status: Number(e.target.value),
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

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						type="submit"
						disabled={createMutation.isPending}
						style={{
							backgroundColor: '#007bff',
							color: 'white',
							padding: '0.75rem 1.5rem',
							border: 'none',
							borderRadius: '4px',
							cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
						}}
					>
						{createMutation.isPending ? 'Creating...' : 'Create Item'}
					</button>

					<button
						type="button"
						onClick={() => navigate({ to: '/items' })}
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
