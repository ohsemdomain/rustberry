import { trpc } from '@/app/trpc'
import type { CustomerAddress } from '@/shared/customer'
import { useState } from 'react'

interface CustomerAddressManagerProps {
	customerId: string
	addresses: CustomerAddress[]
	onAddressesChange: () => void
}

export function CustomerAddressManager({ customerId, addresses, onAddressesChange }: CustomerAddressManagerProps) {
	const [isAdding, setIsAdding] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		address_type: 'billing' as 'billing' | 'shipping',
		address_label: '',
		address_line1: '',
		address_line2: '',
		address_line3: '',
		address_line4: '',
		postcode: '',
		city: '',
		state: '',
		country: '',
		is_default: 0 as 0 | 1,
	})

	const addAddressMutation = trpc.customers.addAddress.useMutation({
		onSuccess: () => {
			setIsAdding(false)
			resetForm()
			onAddressesChange()
		},
	})

	const updateAddressMutation = trpc.customers.updateAddress.useMutation({
		onSuccess: () => {
			setEditingId(null)
			resetForm()
			onAddressesChange()
		},
	})

	const removeAddressMutation = trpc.customers.removeAddress.useMutation({
		onSuccess: () => {
			onAddressesChange()
		},
	})

	const resetForm = () => {
		setFormData({
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
			is_default: 0,
		})
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (editingId) {
			updateAddressMutation.mutate({
				id: editingId,
				...formData,
			})
		} else {
			addAddressMutation.mutate({
				customer_id: customerId,
				...formData,
			})
		}
	}

	const handleEdit = (address: CustomerAddress) => {
		setEditingId(address.id)
		setIsAdding(false)
		setFormData({
			address_type: address.address_type,
			address_label: address.address_label || '',
			address_line1: address.address_line1 || '',
			address_line2: address.address_line2 || '',
			address_line3: address.address_line3 || '',
			address_line4: address.address_line4 || '',
			postcode: address.postcode || '',
			city: address.city || '',
			state: address.state || '',
			country: address.country || '',
			is_default: address.is_default,
		})
	}

	const handleSetDefault = (address: CustomerAddress) => {
		updateAddressMutation.mutate({
			id: address.id,
			is_default: 1,
		})
	}

	const billingAddresses = addresses.filter(a => a.address_type === 'billing')
	const shippingAddresses = addresses.filter(a => a.address_type === 'shipping')

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
				<h3>Addresses</h3>
				{!isAdding && !editingId && (
					<button
						type="button"
						onClick={() => setIsAdding(true)}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Add Address
					</button>
				)}
			</div>

			{/* Address Form */}
			{(isAdding || editingId) && (
				<form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
					<h4>{editingId ? 'Edit Address' : 'Add New Address'}</h4>
					
					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_type" style={{ display: 'block', marginBottom: '0.5rem' }}>
							Address Type *
						</label>
						<select
							id="address_type"
							value={formData.address_type}
							onChange={(e) => setFormData(prev => ({ ...prev, address_type: e.target.value as 'billing' | 'shipping' }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						>
							<option value="billing">Billing</option>
							<option value="shipping">Shipping</option>
						</select>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_label" style={{ display: 'block', marginBottom: '0.5rem' }}>
							Address Label (e.g., Main Office, Warehouse)
						</label>
						<input
							id="address_label"
							type="text"
							value={formData.address_label}
							onChange={(e) => setFormData(prev => ({ ...prev, address_label: e.target.value }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_line1" style={{ display: 'block', marginBottom: '0.5rem' }}>Address Line 1</label>
						<input
							id="address_line1"
							type="text"
							value={formData.address_line1}
							onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_line2" style={{ display: 'block', marginBottom: '0.5rem' }}>Address Line 2</label>
						<input
							id="address_line2"
							type="text"
							value={formData.address_line2}
							onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_line3" style={{ display: 'block', marginBottom: '0.5rem' }}>Address Line 3</label>
						<input
							id="address_line3"
							type="text"
							value={formData.address_line3}
							onChange={(e) => setFormData(prev => ({ ...prev, address_line3: e.target.value }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label htmlFor="address_line4" style={{ display: 'block', marginBottom: '0.5rem' }}>Address Line 4</label>
						<input
							id="address_line4"
							type="text"
							value={formData.address_line4}
							onChange={(e) => setFormData(prev => ({ ...prev, address_line4: e.target.value }))}
							style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
						<div>
							<label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
							<input
								id="city"
								type="text"
								value={formData.city}
								onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
								style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
							/>
						</div>
						<div>
							<label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem' }}>State</label>
							<input
								id="state"
								type="text"
								value={formData.state}
								onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
								style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
							/>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
						<div>
							<label htmlFor="postcode" style={{ display: 'block', marginBottom: '0.5rem' }}>Postcode</label>
							<input
								id="postcode"
								type="text"
								value={formData.postcode}
								onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
								style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
							/>
						</div>
						<div>
							<label htmlFor="country" style={{ display: 'block', marginBottom: '0.5rem' }}>Country</label>
							<input
								id="country"
								type="text"
								value={formData.country}
								onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
								style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
							/>
						</div>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label>
							<input
								type="checkbox"
								checked={formData.is_default === 1}
								onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked ? 1 : 0 }))}
							/>
							{' '}Set as default {formData.address_type} address
						</label>
					</div>

					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<button
							type="submit"
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							{editingId ? 'Update' : 'Add'} Address
						</button>
						<button
							type="button"
							onClick={() => {
								setIsAdding(false)
								setEditingId(null)
								resetForm()
							}}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#6c757d',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* Existing Addresses */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				{/* Billing Addresses */}
				<div>
					<h4>Billing Addresses</h4>
					{billingAddresses.length === 0 ? (
						<p style={{ color: '#666' }}>No billing addresses</p>
					) : (
						billingAddresses.map(address => (
							<div
								key={address.id}
								style={{
									border: '1px solid #ddd',
									padding: '1rem',
									borderRadius: '4px',
									marginBottom: '0.5rem',
								}}
							>
								{address.address_label && (
									<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
										{address.address_label}
										{address.is_default === 1 && (
											<span
												style={{
													marginLeft: '0.5rem',
													backgroundColor: '#007bff',
													color: 'white',
													padding: '0.15rem 0.5rem',
													borderRadius: '4px',
													fontSize: '0.8rem',
												}}
											>
												Default
											</span>
										)}
									</div>
								)}
								{address.address_line1 && <div>{address.address_line1}</div>}
								{address.address_line2 && <div>{address.address_line2}</div>}
								{address.address_line3 && <div>{address.address_line3}</div>}
								{address.address_line4 && <div>{address.address_line4}</div>}
								<div>
									{[address.city, address.state, address.postcode]
										.filter(Boolean)
										.join(', ')}
								</div>
								{address.country && <div>{address.country}</div>}
								
								<div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
									<button
										type="button"
										onClick={() => handleEdit(address)}
										style={{
											padding: '0.25rem 0.5rem',
											backgroundColor: '#17a2b8',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.875rem',
										}}
									>
										Edit
									</button>
									{address.is_default === 0 && (
										<button
											type="button"
											onClick={() => handleSetDefault(address)}
											style={{
												padding: '0.25rem 0.5rem',
												backgroundColor: '#28a745',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.875rem',
											}}
										>
											Set Default
										</button>
									)}
									<button
										type="button"
										onClick={() => {
											if (confirm('Are you sure you want to remove this address?')) {
												removeAddressMutation.mutate(address.id)
											}
										}}
										style={{
											padding: '0.25rem 0.5rem',
											backgroundColor: '#dc3545',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.875rem',
										}}
									>
										Remove
									</button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Shipping Addresses */}
				<div>
					<h4>Shipping Addresses</h4>
					{shippingAddresses.length === 0 ? (
						<p style={{ color: '#666' }}>No shipping addresses</p>
					) : (
						shippingAddresses.map(address => (
							<div
								key={address.id}
								style={{
									border: '1px solid #ddd',
									padding: '1rem',
									borderRadius: '4px',
									marginBottom: '0.5rem',
								}}
							>
								{address.address_label && (
									<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
										{address.address_label}
										{address.is_default === 1 && (
											<span
												style={{
													marginLeft: '0.5rem',
													backgroundColor: '#007bff',
													color: 'white',
													padding: '0.15rem 0.5rem',
													borderRadius: '4px',
													fontSize: '0.8rem',
												}}
											>
												Default
											</span>
										)}
									</div>
								)}
								{address.address_line1 && <div>{address.address_line1}</div>}
								{address.address_line2 && <div>{address.address_line2}</div>}
								{address.address_line3 && <div>{address.address_line3}</div>}
								{address.address_line4 && <div>{address.address_line4}</div>}
								<div>
									{[address.city, address.state, address.postcode]
										.filter(Boolean)
										.join(', ')}
								</div>
								{address.country && <div>{address.country}</div>}
								
								<div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
									<button
										type="button"
										onClick={() => handleEdit(address)}
										style={{
											padding: '0.25rem 0.5rem',
											backgroundColor: '#17a2b8',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.875rem',
										}}
									>
										Edit
									</button>
									{address.is_default === 0 && (
										<button
											type="button"
											onClick={() => handleSetDefault(address)}
											style={{
												padding: '0.25rem 0.5rem',
												backgroundColor: '#28a745',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '0.875rem',
											}}
										>
											Set Default
										</button>
									)}
									<button
										type="button"
										onClick={() => {
											if (confirm('Are you sure you want to remove this address?')) {
												removeAddressMutation.mutate(address.id)
											}
										}}
										style={{
											padding: '0.25rem 0.5rem',
											backgroundColor: '#dc3545',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '0.875rem',
										}}
									>
										Remove
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}