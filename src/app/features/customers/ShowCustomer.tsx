import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowCustomerProps {
	customerId: string
}

export function ShowCustomer({ customerId }: ShowCustomerProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	if (isLoading) return <div style={{ padding: '1rem' }}>Loading...</div>
	if (error)
		return <div style={{ padding: '1rem' }}>Error: {error.message}</div>
	if (!customer)
		return <div style={{ padding: '1rem' }}>Customer not found</div>

	return (
		<div style={{ padding: '1rem', maxWidth: '800px' }}>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginBottom: '2rem',
				}}
			>
				<h1>Customer Details</h1>
				<div style={{ display: 'flex', gap: '1rem' }}>
					{hasPermission('customers', 'update-any') && (
						<Link
							to="/customers/$customerId/edit"
							params={{ customerId: customer.id }}
						>
							Edit Customer
						</Link>
					)}
					<button type="button" onClick={() => navigate({ to: '/customers' })}>
						Back to Customers
					</button>
				</div>
			</div>

			{/* Customer Info */}
			<div style={{ lineHeight: '1.8' }}>
				<div>
					<strong>Customer ID:</strong> {customer.id}
				</div>
				<div>
					<strong>Customer Name:</strong> {customer.customer_name}
				</div>
				<div>
					<strong>Email:</strong>{' '}
					{customer.customer_email || 'No email provided'}
				</div>
				<div>
					<strong>Status:</strong>{' '}
					<span style={{ color: customer.status === 1 ? 'green' : 'red' }}>
						{customer.status === 1 ? 'Active' : 'Inactive'}
					</span>
				</div>

				{/* Phone Contacts */}
				<div style={{ marginTop: '1rem' }}>
					<strong>Phone Contacts:</strong>
					{customer.contacts && customer.contacts.length > 0 ? (
						<div>
							{customer.contacts.map((contact) => (
								<div key={contact.id} style={{ marginLeft: '1rem' }}>
									{contact.phone_number}
									{contact.phone_label && ` (${contact.phone_label})`}
									{contact.is_primary === 1 && <strong> Primary</strong>}
								</div>
							))}
						</div>
					) : (
						<span> No phone contacts</span>
					)}
				</div>

				{/* Addresses */}
				{customer.addresses && customer.addresses.length > 0 && (
					<div style={{ marginTop: '1rem' }}>
						{/* Billing addresses */}
						{customer.addresses.filter(
							(addr) => addr.address_type === 'billing',
						).length > 0 && (
							<div style={{ marginBottom: '1rem' }}>
								<strong>Billing Addresses:</strong>
								{customer.addresses
									.filter((addr) => addr.address_type === 'billing')
									.map((address) => (
										<div
											key={address.id}
											style={{ marginLeft: '1rem', marginTop: '0.5rem' }}
										>
											{address.address_label && (
												<div>
													<strong>{address.address_label}</strong>{' '}
													{address.is_default === 1 && '(Default)'}
												</div>
											)}
											{address.address_line1 && (
												<div>{address.address_line1}</div>
											)}
											{address.address_line2 && (
												<div>{address.address_line2}</div>
											)}
											{address.address_line3 && (
												<div>{address.address_line3}</div>
											)}
											{address.address_line4 && (
												<div>{address.address_line4}</div>
											)}
											<div>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</div>
											{address.country && <div>{address.country}</div>}
										</div>
									))}
							</div>
						)}

						{/* Shipping addresses */}
						{customer.addresses.filter(
							(addr) => addr.address_type === 'shipping',
						).length > 0 && (
							<div>
								<strong>Shipping Addresses:</strong>
								{customer.addresses
									.filter((addr) => addr.address_type === 'shipping')
									.map((address) => (
										<div
											key={address.id}
											style={{ marginLeft: '1rem', marginTop: '0.5rem' }}
										>
											{address.address_label && (
												<div>
													<strong>{address.address_label}</strong>{' '}
													{address.is_default === 1 && '(Default)'}
												</div>
											)}
											{address.address_line1 && (
												<div>{address.address_line1}</div>
											)}
											{address.address_line2 && (
												<div>{address.address_line2}</div>
											)}
											{address.address_line3 && (
												<div>{address.address_line3}</div>
											)}
											{address.address_line4 && (
												<div>{address.address_line4}</div>
											)}
											<div>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</div>
											{address.country && <div>{address.country}</div>}
										</div>
									))}
							</div>
						)}
					</div>
				)}

				{/* Metadata */}
				<div
					style={{
						marginTop: '2rem',
						paddingTop: '1rem',
						borderTop: '1px solid #ddd',
						fontSize: '0.9rem',
						color: '#666',
					}}
				>
					<div>Created: {formatDateTime(customer.created_at)}</div>
					<div>Updated: {formatDateTime(customer.updated_at)}</div>
				</div>
			</div>
		</div>
	)
}
