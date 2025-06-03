import { useState } from 'react'

export interface PhoneContact {
	id?: string
	phone_number: string
	phone_label: string | null
	is_primary: 0 | 1
}

interface ContactManagerProps {
	contacts: PhoneContact[]
	onAdd: (contact: PhoneContact) => void
	onRemove: (index: number) => void
	onSetPrimary: (index: number) => void
	isPending?: boolean
}

export function ContactManager({
	contacts,
	onAdd,
	onRemove,
	onSetPrimary,
	isPending = false,
}: ContactManagerProps) {
	const [newContact, setNewContact] = useState<PhoneContact>({
		phone_number: '',
		phone_label: null,
		is_primary: 0,
	})

	const handleAddContact = () => {
		if (!newContact.phone_number) return
		onAdd(newContact)
		setNewContact({ phone_number: '', phone_label: null, is_primary: 0 })
	}

	return (
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
									onClick={() => onSetPrimary(index)}
									disabled={isPending}
									style={{
										padding: '0.25rem 0.5rem',
										backgroundColor: '#28a745',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										cursor: isPending ? 'not-allowed' : 'pointer',
									}}
								>
									Set Primary
								</button>
							)}
							<button
								type="button"
								onClick={() => onRemove(index)}
								disabled={isPending}
								style={{
									padding: '0.25rem 0.5rem',
									backgroundColor: '#dc3545',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: isPending ? 'not-allowed' : 'pointer',
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
				<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
				<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
						disabled={!newContact.phone_number || isPending}
						style={{
							marginLeft: 'auto',
							padding: '0.5rem 1rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor:
								!newContact.phone_number || isPending
									? 'not-allowed'
									: 'pointer',
						}}
					>
						Add Contact
					</button>
				</div>
			</div>
		</div>
	)
}
