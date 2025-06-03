export interface AddressFormData {
	address_type: 'billing' | 'shipping'
	address_label: string
	address_line1: string
	address_line2: string
	address_line3: string
	address_line4: string
	postcode: string
	city: string
	state: string
	country: string
	is_default: 0 | 1
}

interface AddressFormProps {
	formData: AddressFormData
	onChange: (data: AddressFormData) => void
	showTypeSelector?: boolean
	addressTypeLabel?: string
}

export function AddressForm({
	formData,
	onChange,
	showTypeSelector = true,
	addressTypeLabel,
}: AddressFormProps) {
	const handleChange = (
		field: keyof AddressFormData,
		value: string | number,
	) => {
		onChange({
			...formData,
			[field]: value,
		})
	}

	return (
		<div>
			{showTypeSelector && (
				<div style={{ marginBottom: '1rem' }}>
					<label
						htmlFor="address_type"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Address Type *
					</label>
					<select
						id="address_type"
						value={formData.address_type}
						onChange={(e) =>
							handleChange(
								'address_type',
								e.target.value as 'billing' | 'shipping',
							)
						}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					>
						<option value="billing">Billing</option>
						<option value="shipping">Shipping</option>
					</select>
				</div>
			)}

			<div style={{ marginBottom: '1rem' }}>
				<label
					htmlFor="address_label"
					style={{ display: 'block', marginBottom: '0.5rem' }}
				>
					{addressTypeLabel || 'Address Label'} (e.g., Main Office, Warehouse)
				</label>
				<input
					id="address_label"
					type="text"
					value={formData.address_label}
					onChange={(e) => handleChange('address_label', e.target.value)}
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
					htmlFor="address_line1"
					style={{ display: 'block', marginBottom: '0.5rem' }}
				>
					Address Line 1 {!showTypeSelector && '*'}
				</label>
				<input
					id="address_line1"
					type="text"
					value={formData.address_line1}
					onChange={(e) => handleChange('address_line1', e.target.value)}
					required={!showTypeSelector}
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
					htmlFor="address_line2"
					style={{ display: 'block', marginBottom: '0.5rem' }}
				>
					Address Line 2
				</label>
				<input
					id="address_line2"
					type="text"
					value={formData.address_line2}
					onChange={(e) => handleChange('address_line2', e.target.value)}
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
					htmlFor="address_line3"
					style={{ display: 'block', marginBottom: '0.5rem' }}
				>
					Address Line 3
				</label>
				<input
					id="address_line3"
					type="text"
					value={formData.address_line3}
					onChange={(e) => handleChange('address_line3', e.target.value)}
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
					htmlFor="address_line4"
					style={{ display: 'block', marginBottom: '0.5rem' }}
				>
					Address Line 4
				</label>
				<input
					id="address_line4"
					type="text"
					value={formData.address_line4}
					onChange={(e) => handleChange('address_line4', e.target.value)}
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
						htmlFor="city"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						City
					</label>
					<input
						id="city"
						type="text"
						value={formData.city}
						onChange={(e) => handleChange('city', e.target.value)}
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
						htmlFor="state"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						State
					</label>
					<input
						id="state"
						type="text"
						value={formData.state}
						onChange={(e) => handleChange('state', e.target.value)}
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
						htmlFor="postcode"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Postcode
					</label>
					<input
						id="postcode"
						type="text"
						value={formData.postcode}
						onChange={(e) => handleChange('postcode', e.target.value)}
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
						htmlFor="country"
						style={{ display: 'block', marginBottom: '0.5rem' }}
					>
						Country
					</label>
					<input
						id="country"
						type="text"
						value={formData.country}
						onChange={(e) => handleChange('country', e.target.value)}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ccc',
							borderRadius: '4px',
						}}
					/>
				</div>
			</div>

			{showTypeSelector && (
				<div style={{ marginBottom: '1rem' }}>
					<label>
						<input
							type="checkbox"
							checked={formData.is_default === 1}
							onChange={(e) =>
								handleChange('is_default', e.target.checked ? 1 : 0)
							}
						/>{' '}
						Set as default {formData.address_type} address
					</label>
				</div>
			)}
		</div>
	)
}
