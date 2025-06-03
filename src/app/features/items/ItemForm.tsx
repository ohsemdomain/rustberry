import { trpc } from '@/app/trpc'
import {
	centsToDisplay,
	displayToCents,
	sanitizePriceInput,
} from '@/app/utils/price'
import { ItemCategory, ItemStatus } from '@/shared/items'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface ItemFormProps {
	itemId?: string
}

export function ItemForm({ itemId }: ItemFormProps) {
	const isEditMode = !!itemId
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		item_name: '',
		item_category: ItemCategory.PACKAGING,
		item_price_display: '',
		item_description: '',
		item_status: ItemStatus.ACTIVE, // Only used in edit mode
	})

	// Fetch existing item if in edit mode
	const { data: item, isLoading } = trpc.items.getById.useQuery(itemId!, {
		enabled: isEditMode,
	})

	// Populate form when item loads
	useEffect(() => {
		if (item && isEditMode) {
			setFormData({
				item_name: item.item_name,
				item_category: item.item_category,
				item_price_display: centsToDisplay(item.item_price_cents),
				item_description: item.item_description || '',
				item_status: item.item_status,
			})
		}
	}, [item, isEditMode])

	const createMutation = trpc.items.create.useMutation({
		onSuccess: () => {
			navigate({ to: '/items' })
		},
		onError: (error) => {
			alert(`Error: ${error.message}`)
		},
	})

	const updateMutation = trpc.items.update.useMutation({
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

		if (isEditMode) {
			updateMutation.mutate({
				id: itemId,
				item_name: formData.item_name,
				item_category: formData.item_category,
				item_price_cents,
				item_description: formData.item_description || null,
				item_status: formData.item_status,
			})
		} else {
			createMutation.mutate({
				item_name: formData.item_name,
				item_category: formData.item_category,
				item_price_cents,
				item_description: formData.item_description || undefined,
			})
		}
	}

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sanitized = sanitizePriceInput(e.target.value)
		setFormData((prev) => ({ ...prev, item_price_display: sanitized }))
	}

	if (isEditMode && isLoading)
		return <div style={{ padding: '1rem' }}>Loading...</div>

	const isPending = createMutation.isPending || updateMutation.isPending

	return (
		<div className="component-wrapper">
			<div className="content-header">
				<h1>{isEditMode ? 'Edit Item' : 'Create New Item'}</h1>
			</div>

			<div className="content-body">
				<div className="form-container">
					<form onSubmit={handleSubmit}>
						<div className="form-row">
							<label htmlFor="item_name">Item Name *</label>
							<input
								type="text"
								id="item_name"
								value={formData.item_name}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										item_name: e.target.value,
									}))
								}
								required
							/>
						</div>

						<div className="form-row">
							<label htmlFor="item_category">Category *</label>
							<select
								className="custom-select"
								id="item_category"
								value={formData.item_category}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										item_category: Number(e.target.value) as ItemCategory,
									}))
								}
								required
							>
								<option value={ItemCategory.PACKAGING}>Packaging</option>
								<option value={ItemCategory.LABEL}>Label</option>
								<option value={ItemCategory.OTHER}>Other</option>
							</select>
						</div>

						<div className="form-row">
							<label htmlFor="item_price">Price (RM) *</label>
							<input
								type="text"
								id="item_price"
								value={formData.item_price_display}
								onChange={handlePriceChange}
								placeholder="25.00"
								required
							/>
						</div>

						<div className="form-row textarea-row">
							<label htmlFor="item_description">Description</label>
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
							/>
						</div>

						{/* Status field only shown in edit mode */}
						{isEditMode && (
							<div className="form-row">
								<label htmlFor="item_status">Status</label>
								<select
									className="custom-select"
									id="item_status"
									value={formData.item_status}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											item_status: Number(e.target.value) as ItemStatus,
										}))
									}
								>
									<option value={ItemStatus.ACTIVE}>Active</option>
									<option value={ItemStatus.INACTIVE}>Inactive</option>
								</select>
							</div>
						)}

						<div className="form-actions">
							<button
								className="button-blue"
								type="submit"
								disabled={isPending}
							>
								{isPending
									? isEditMode
										? 'Updating...'
										: 'Creating...'
									: isEditMode
										? 'Update Item'
										: 'Create Item'}
							</button>

							<button
								className="button-gray"
								type="button"
								onClick={() => navigate({ to: '/items' })}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
